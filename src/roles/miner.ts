import { harvestEnergy } from "../tasks/energy";
import { moveToTarget } from "../tasks/movement";

function sourceExtensions(creep: Creep): StructureExtension[] {
  const source = creep.memory.sourceId ? Game.getObjectById(creep.memory.sourceId) : null;
  if (!source) return [];

  return source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
    filter: (structure: Structure) =>
      structure.structureType === STRUCTURE_EXTENSION &&
      (structure as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY) > 0
  }) as StructureExtension[];
}

function sourceContainer(creep: Creep): StructureContainer | null {
  const source = creep.memory.sourceId ? Game.getObjectById(creep.memory.sourceId) : null;
  if (!source) return null;

  const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (structure: Structure) => structure.structureType === STRUCTURE_CONTAINER
  }) as StructureContainer[];

  return containers[0] ?? null;
}

export function runMiner(creep: Creep): void {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    const extension = creep.pos.findClosestByRange(sourceExtensions(creep));
    if (extension) {
      const result = creep.transfer(extension, RESOURCE_ENERGY);
      if (result === ERR_NOT_IN_RANGE) {
        moveToTarget(creep, extension);
      }
      return;
    }
  }

  const container = sourceContainer(creep);
  if (container && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    const transfer = creep.transfer(container, RESOURCE_ENERGY);
    if (transfer === ERR_NOT_IN_RANGE) {
      moveToTarget(creep, container);
    }
    return;
  }

  if (container && creep.pos.getRangeTo(container) > 0) {
    moveToTarget(creep, container, 0);
    return;
  }

  harvestEnergy(creep);
}
