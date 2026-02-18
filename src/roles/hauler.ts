import { fillPriorityEnergyTargets, pickupDroppedEnergy, withdrawStoredEnergy } from "../tasks/energy";
import { COLONY_SETTINGS } from "../config/settings";
import { moveToTarget } from "../tasks/movement";
import { updateWorkingState } from "./common";

function isNearSourcePosition(pos: RoomPosition, source: Source | null, range: number): boolean {
  if (!source) return false;
  return pos.getRangeTo(source) <= range;
}

function isNearAnySource(room: Room, pos: RoomPosition, range = 2): boolean {
  const sources = room.find(FIND_SOURCES);
  return sources.some((source) => pos.getRangeTo(source) <= range);
}

function withdrawFromSourceExtensions(creep: Creep, assignedSource: Source | null): boolean {
  const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType !== STRUCTURE_EXTENSION) return false;
      const isValidSourceExtension = assignedSource
        ? isNearSourcePosition(structure.pos, assignedSource, 2)
        : isNearAnySource(creep.room, structure.pos, 2);
      if (!isValidSourceExtension) return false;
      const extension = structure as StructureExtension;
      return extension.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }
  }) as StructureExtension | null;

  if (!target) return false;

  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
    return true;
  }

  return result === OK;
}

function withdrawFromSourceContainers(creep: Creep, assignedSource: Source | null): boolean {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType !== STRUCTURE_CONTAINER) return false;
      const isValidSourceContainer = assignedSource
        ? isNearSourcePosition(structure.pos, assignedSource, 1)
        : isNearAnySource(creep.room, structure.pos, 1);
      if (!isValidSourceContainer) return false;
      const container = structure as StructureContainer;
      return container.store.getUsedCapacity(RESOURCE_ENERGY) >= COLONY_SETTINGS.energy.haulerContainerWithdrawMinEnergy;
    }
  }) as StructureContainer | null;

  if (!target) return false;

  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
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
    moveToTarget(creep, target);
    return true;
  }

  return result === OK;
}

export function runHauler(creep: Creep): void {
  updateWorkingState(creep);
  const assignedSource =
    creep.memory.lockSource && creep.memory.sourceId
      ? Game.getObjectById(creep.memory.sourceId as Id<Source>)
      : null;
  const isDedicated = Boolean(assignedSource);

  if (!creep.memory.working) {
    if (withdrawFromSourceExtensions(creep, assignedSource)) return;
    if (withdrawFromSourceContainers(creep, assignedSource)) return;

    if (!isDedicated) {
      if (withdrawStoredEnergy(creep)) return;
      pickupDroppedEnergy(creep);
    }

    return;
  }

  if (fillCoreEnergyTargets(creep)) return;
  fillPriorityEnergyTargets(creep);
}
