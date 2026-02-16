import { ROLE_ORDER, type RoleName } from "../config/roles";
import type { RoomSnapshot } from "./types";

function emptyRoleCounts(): Record<RoleName, number> {
  const counts = {} as Record<RoleName, number>;
  for (const role of ROLE_ORDER) {
    counts[role] = 0;
  }
  return counts;
}

export function collectRoomSnapshot(room: Room): RoomSnapshot {
  const creepsByRole = emptyRoleCounts();
  for (const creep of Object.values(Game.creeps)) {
    if (creep.memory.homeRoom !== room.name) continue;
    creepsByRole[creep.memory.role] += 1;
  }

  const structures = room.find(FIND_STRUCTURES);
  const structuresByType: Partial<Record<StructureConstant, number>> = {};
  for (const structure of structures) {
    structuresByType[structure.structureType] = (structuresByType[structure.structureType] ?? 0) + 1;
  }

  const storageEnergy = room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
  const controller = room.controller;

  return {
    roomName: room.name,
    rcl: controller?.level ?? 0,
    energyAvailable: room.energyAvailable,
    energyCapacityAvailable: room.energyCapacityAvailable,
    sourceCount: room.find(FIND_SOURCES).length,
    constructionSiteCount: room.find(FIND_CONSTRUCTION_SITES).length,
    hostileCount: room.find(FIND_HOSTILE_CREEPS).length,
    storageEnergy,
    structuresByType,
    creepsByRole
  };
}
