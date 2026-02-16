import { STAGE_THRESHOLDS, type CapabilityFlags, type ColonyStage } from "../config/colonyStages";
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
  return snapshot.rcl >= 4 && gclLevel > myRooms;
}

function canAttack(snapshot: RoomSnapshot): boolean {
  return snapshot.rcl >= 6 && snapshot.storageEnergy >= 100000;
}

export function deriveCapabilities(snapshot: RoomSnapshot, stage: ColonyStage): CapabilityFlags {
  return {
    allowRoads: stage !== "bootstrap",
    allowTowers: snapshot.rcl >= 3,
    allowWalls: snapshot.rcl >= 4,
    allowRemoteMining: snapshot.rcl >= 3 && snapshot.energyCapacityAvailable >= 800,
    allowExpansion: canExpand(snapshot),
    allowOffense: canAttack(snapshot)
  };
}

export function deriveStageAndCapabilities(snapshot: RoomSnapshot): { stage: ColonyStage; capabilities: CapabilityFlags } {
  const stage = deriveStage(snapshot);
  const capabilities = deriveCapabilities(snapshot, stage);
  return { stage, capabilities };
}
