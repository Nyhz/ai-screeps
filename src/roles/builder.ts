export function runBuilder(creep: Creep): void {
  if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.working = false;
  }
  if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }

  if (creep.memory.working) {
    const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (site) {
      if (creep.build(site) === ERR_NOT_IN_RANGE) {
        creep.moveTo(site, { visualizePathStyle: { stroke: "#ab47bc" } });
      }
      return;
    }

    const controller = creep.room.controller;
    if (!controller) return;
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller, { visualizePathStyle: { stroke: "#66bb6a" } });
    }
    return;
  }

  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) =>
      (structure.structureType === STRUCTURE_CONTAINER ||
        structure.structureType === STRUCTURE_STORAGE) &&
      (structure as StructureContainer | StructureStorage).store.getUsedCapacity(RESOURCE_ENERGY) > 0
  }) as StructureContainer | StructureStorage | null;

  if (container) {
    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, { visualizePathStyle: { stroke: "#ffa726" } });
    }
    return;
  }

  const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (!source) return;
  if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
    creep.moveTo(source, { visualizePathStyle: { stroke: "#ffa726" } });
  }
}
