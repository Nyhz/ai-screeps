import type { CapabilityFlags, ColonyStage } from "../config/colonyStages";
import {
  COLONY_SETTINGS,
  getBootstrapTargetRooms,
  getPendingManualClaimTargets,
  isUpgradingPaused,
  resolveRoomSettings
} from "../config/settings";
import { ROLE_ORDER, type RoleName } from "../config/roles";
import { getEmergencySoldierCount } from "../managers/threatManager";
import type { RoomSnapshot } from "./types";

function baseDesired(): Record<RoleName, number> {
  const desired = {} as Record<RoleName, number>;
  for (const role of ROLE_ORDER) {
    desired[role] = 0;
  }
  return desired;
}

function applyRoleOverrides(target: Record<RoleName, number>, overrides: Partial<Record<RoleName, number>>): void {
  for (const role of ROLE_ORDER) {
    const desired = overrides[role];
    if (desired === undefined) continue;
    target[role] = Math.max(0, desired);
  }
}

function shouldRunMineralPipeline(snapshot: RoomSnapshot): boolean {
  if (!COLONY_SETTINGS.minerals.enabled) return false;
  if (snapshot.rcl < COLONY_SETTINGS.minerals.minRcl) return false;

  const room = Game.rooms[snapshot.roomName];
  if (!room) return false;

  if (COLONY_SETTINGS.minerals.requireStorage && !room.storage) return false;

  const mineral = room.find(FIND_MINERALS)[0];
  return Boolean(mineral && mineral.mineralAmount > 0);
}

function shouldSpawnClaimer(snapshot: RoomSnapshot): boolean {
  if (COLONY_SETTINGS.expansion.autoClaimNeighbors) return true;
  return getPendingManualClaimTargets(snapshot.roomName).length > 0;
}

export function deriveDesiredRoles(
  snapshot: RoomSnapshot,
  stage: ColonyStage,
  capabilities: CapabilityFlags
): Record<RoleName, number> {
  const desired = baseDesired();
  const roomSettings = resolveRoomSettings(snapshot.roomName);
  const roomState = Memory.roomState?.[snapshot.roomName] ?? "developing";

  // Always keep a minimum survival workforce so a room can recover from wipes.
  desired.harvester = Math.max(COLONY_SETTINGS.planner.minHarvesters, snapshot.sourceCount);
  desired.hauler = COLONY_SETTINGS.planner.baseHaulers;
  desired.upgrader = COLONY_SETTINGS.planner.baseUpgraders;
  desired.builder =
    snapshot.constructionSiteCount > 0
      ? COLONY_SETTINGS.planner.buildersWhenSitesExist
      : COLONY_SETTINGS.planner.buildersWhenNoSites;

  if (stage !== "bootstrap") {
    const canRunDedicatedMiners = snapshot.energyCapacityAvailable >= 400;
    desired.harvester = canRunDedicatedMiners
      ? Math.min(desired.harvester, 1)
      : Math.max(COLONY_SETTINGS.planner.minHarvesters, snapshot.sourceCount);
    desired.miner = canRunDedicatedMiners ? snapshot.sourceCount * Math.max(1, COLONY_SETTINGS.planner.minersPerSource) : 0;
    desired.hauler = Math.max(
      desired.hauler,
      snapshot.sourceCount * Math.max(0, COLONY_SETTINGS.planner.dedicatedHaulersPerSource) +
        Math.max(0, COLONY_SETTINGS.planner.freeHaulers)
    );
    desired.upgrader = COLONY_SETTINGS.planner.upgradersByStage[stage];
    desired.builder =
      snapshot.constructionSiteCount > COLONY_SETTINGS.planner.heavyBuildSiteThreshold
        ? COLONY_SETTINGS.planner.heavyBuilderCount
        : desired.builder;
    desired.repairer = COLONY_SETTINGS.planner.repairersWhenEstablished;
  }

  if (capabilities.allowWalls) {
    desired.waller = 1;
  }

  if (capabilities.allowRemoteMining) {
    desired.scout = COLONY_SETTINGS.planner.scoutCount;
    desired.reserver = COLONY_SETTINGS.planner.reserverCount;
  }

  if (capabilities.allowExpansion && shouldSpawnClaimer(snapshot)) {
    desired.claimer = COLONY_SETTINGS.planner.claimerCount;
  }

  const bootstrapTargets = getBootstrapTargetRooms(snapshot.roomName);
  if (bootstrapTargets.length > 0) {
    desired.bootstrapper = bootstrapTargets.length * COLONY_SETTINGS.expansion.bootstrapperCountPerTargetRoom;
  }

  if (capabilities.allowOffense) {
    desired.soldier = Math.max(
      COLONY_SETTINGS.planner.minSoldiers,
      Math.ceil(snapshot.hostileCount / Math.max(1, COLONY_SETTINGS.planner.hostilesPerSoldier))
    );
  }

  if (shouldRunMineralPipeline(snapshot)) {
    desired.mineralMiner = COLONY_SETTINGS.minerals.minerCount;
    desired.mineralHauler = COLONY_SETTINGS.minerals.haulerCount;
  }

  const emergencySoldiers = getEmergencySoldierCount(snapshot.roomName);
  if (emergencySoldiers > 0) {
    desired.soldier = Math.max(desired.soldier, emergencySoldiers);
  }

  if (roomState === "war") {
    desired.upgrader = Math.min(desired.upgrader, 1);
    desired.builder = Math.min(desired.builder, 1);
    desired.hauler = Math.max(desired.hauler, snapshot.sourceCount + 1);
    desired.repairer = Math.max(desired.repairer, 2);
  } else if (roomState === "recovery") {
    desired.upgrader = Math.min(desired.upgrader, 2);
    desired.repairer = Math.max(desired.repairer, 1);
  }

  const room = Game.rooms[snapshot.roomName];
  if (room && isUpgradingPaused(room)) {
    desired.upgrader = 0;
  }

  applyRoleOverrides(desired, COLONY_SETTINGS.roleTargets.default);
  applyRoleOverrides(desired, COLONY_SETTINGS.roleTargets.byStage[stage] ?? {});
  applyRoleOverrides(desired, roomSettings.roleTargets);
  applyRoleOverrides(desired, roomSettings.roleTargetsByStage[stage] ?? {});

  return desired;
}
