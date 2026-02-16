import { moveToTarget } from "./movement";

function assignSource(creep: Creep): Source | null {
  if (creep.memory.sourceId) {
    const source = Game.getObjectById(creep.memory.sourceId as Id<Source>);
    if (source) return source;
  }

  const sources = creep.room.find(FIND_SOURCES);
  if (sources.length === 0) return null;
  const source = sources[Game.time % sources.length];
  creep.memory.sourceId = source.id;
  return source;
}

export function harvestEnergy(creep: Creep): boolean {
  const source = assignSource(creep);
  if (!source) return false;

  const result = creep.harvest(source);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, source);
    return true;
  }

  return result === OK;
}

export function withdrawStoredEnergy(creep: Creep): boolean {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_CONTAINER) {
        return (structure as StructureStorage | StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 0;
      }
      return false;
    }
  }) as StructureStorage | StructureContainer | null;

  if (!target) return false;

  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
    return true;
  }

  return result === OK;
}

export function pickupDroppedEnergy(creep: Creep): boolean {
  const resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (dropped: Resource) => dropped.resourceType === RESOURCE_ENERGY && dropped.amount > 50
  });

  if (!resource) return false;

  const result = creep.pickup(resource);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, resource);
    return true;
  }

  return result === OK;
}

export function fillPriorityEnergyTargets(creep: Creep): boolean {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (
        structure.structureType === STRUCTURE_SPAWN ||
        structure.structureType === STRUCTURE_EXTENSION ||
        structure.structureType === STRUCTURE_TOWER
      ) {
        return (structure as StructureSpawn | StructureExtension | StructureTower).store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
      return false;
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
