import { STAGE_THRESHOLDS, type CapabilityFlags, type ColonyStage } from "../config/colonyStages";
import { COLONY_SETTINGS, resolveRoomSettings } from "../config/settings";
import type { RoomSnapshot } from "./types";

function deriveStage(snapshot: RoomSnapshot): ColonyStage {
  for (const threshold of STAGE_THRESHOLDS) {
    if (snapshot.rcl >= threshold.minRcl && snapshot.energyCapacityAvailable >= threshold.minEnergyCapacity) {
      return threshold.stage;
    }
  }

  return "bootstrap";
}

function ownedRoomCount(): number {
  return Object.values(Game.rooms).filter((room) => room.controller?.my).length;
}

function canExpand(snapshot: RoomSnapshot): boolean {
  const gclLevel = Game.gcl.level;
  const myRooms = ownedRoomCount();
  return snapshot.rcl >= COLONY_SETTINGS.stage.expansionMinRcl && gclLevel > myRooms;
}

function canAttack(snapshot: RoomSnapshot): boolean {
  const roomSettings = resolveRoomSettings(snapshot.roomName);
  if (!COLONY_SETTINGS.combat.offenseEnabled || !COLONY_SETTINGS.pvp.enabled || roomSettings.disablePvP) return false;
  return (
    snapshot.rcl >= COLONY_SETTINGS.stage.offenseMinRcl &&
    snapshot.storageEnergy >= COLONY_SETTINGS.stage.offenseMinStorageEnergy
  );
}

export function deriveCapabilities(snapshot: RoomSnapshot, stage: ColonyStage): CapabilityFlags {
  return {
    allowRoads: stage !== "bootstrap",
    allowTowers: snapshot.rcl >= COLONY_SETTINGS.stage.towersMinRcl,
    allowWalls: snapshot.rcl >= COLONY_SETTINGS.stage.wallsMinRcl,
    allowRemoteMining:
      snapshot.rcl >= COLONY_SETTINGS.stage.remoteMiningMinRcl &&
      snapshot.energyCapacityAvailable >= COLONY_SETTINGS.stage.remoteMiningMinEnergyCapacity,
    allowExpansion: canExpand(snapshot),
    allowOffense: canAttack(snapshot)
  };
}

export function deriveStageAndCapabilities(snapshot: RoomSnapshot): { stage: ColonyStage; capabilities: CapabilityFlags } {
  const stage = deriveStage(snapshot);
  const capabilities = deriveCapabilities(snapshot, stage);
  return { stage, capabilities };
}
