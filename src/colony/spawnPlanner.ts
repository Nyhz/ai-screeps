import type { CapabilityFlags, ColonyStage } from "../config/colonyStages";
import { COLONY_SETTINGS, getBootstrapTargetRooms, getPendingManualClaimTargets, resolveRoomSettings } from "../config/settings";
import { ROLE_ORDER, type RoleName } from "../config/roles";
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

  // Always keep a minimum survival workforce so a room can recover from wipes.
  desired.harvester = Math.max(COLONY_SETTINGS.planner.minHarvesters, snapshot.sourceCount);
  desired.hauler = COLONY_SETTINGS.planner.baseHaulers;
  desired.upgrader = COLONY_SETTINGS.planner.baseUpgraders;
  desired.builder =
    snapshot.constructionSiteCount > 0
      ? COLONY_SETTINGS.planner.buildersWhenSitesExist
      : COLONY_SETTINGS.planner.buildersWhenNoSites;

  if (stage !== "bootstrap") {
    desired.miner = snapshot.sourceCount;
    desired.hauler = Math.max(
      desired.hauler,
      snapshot.sourceCount * COLONY_SETTINGS.planner.haulersPerSource,
      COLONY_SETTINGS.planner.baseHaulers
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

  applyRoleOverrides(desired, COLONY_SETTINGS.roleTargets.default);
  applyRoleOverrides(desired, COLONY_SETTINGS.roleTargets.byStage[stage] ?? {});
  applyRoleOverrides(desired, roomSettings.roleTargets);
  applyRoleOverrides(desired, roomSettings.roleTargetsByStage[stage] ?? {});

  return desired;
}
