import { fillPriorityEnergyTargets, pickupDroppedEnergy, withdrawStoredEnergy } from "../tasks/energy";
import { COLONY_SETTINGS } from "../config/settings";
import { updateWorkingState } from "./common";

function isNearAnySource(room: Room, pos: RoomPosition, range = 2): boolean {
  const sources = room.find(FIND_SOURCES);
  return sources.some((source) => pos.getRangeTo(source) <= range);
}

function withdrawFromSourceExtensions(creep: Creep): boolean {
  const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType !== STRUCTURE_EXTENSION) return false;
      if (!isNearAnySource(creep.room, structure.pos, 2)) return false;
      const extension = structure as StructureExtension;
      return extension.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }
  }) as StructureExtension | null;

  if (!target) return false;

  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { reusePath: 15, visualizePathStyle: { stroke: "#219ebc" } });
    return true;
  }

  return result === OK;
}

function withdrawFromSourceContainers(creep: Creep): boolean {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType !== STRUCTURE_CONTAINER) return false;
      if (!isNearAnySource(creep.room, structure.pos, 1)) return false;
      const container = structure as StructureContainer;
      return container.store.getUsedCapacity(RESOURCE_ENERGY) >= COLONY_SETTINGS.energy.haulerContainerWithdrawMinEnergy;
    }
  }) as StructureContainer | null;

  if (!target) return false;

  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { reusePath: 15, visualizePathStyle: { stroke: "#219ebc" } });
    return true;
  }

  return result === OK;
}

function fillCoreEnergyTargets(creep: Creep): boolean {
  const homeRoom = Game.rooms[creep.memory.homeRoom];
  const anchor = homeRoom?.find(FIND_MY_SPAWNS)[0]?.pos;

  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_TOWER) {
        return (structure as StructureSpawn | StructureTower).store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }

      if (structure.structureType !== STRUCTURE_EXTENSION) return false;
      if (anchor && structure.pos.getRangeTo(anchor) > COLONY_SETTINGS.logistics.coreDeliveryRangeFromSpawn) return false;
      return (structure as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }
  }) as StructureSpawn | StructureExtension | StructureTower | null;

  if (!target) return false;

  const result = creep.transfer(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { reusePath: 10, visualizePathStyle: { stroke: "#219ebc" } });
    return true;
  }

  return result === OK;
}

export function runHauler(creep: Creep): void {
  updateWorkingState(creep);

  if (!creep.memory.working) {
    if (withdrawFromSourceExtensions(creep)) return;
    if (withdrawFromSourceContainers(creep)) return;
    if (withdrawStoredEnergy(creep)) return;
    pickupDroppedEnergy(creep);
    return;
  }

  if (fillCoreEnergyTargets(creep)) return;
  fillPriorityEnergyTargets(creep);
}
