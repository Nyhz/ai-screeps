export function countRole(role: CreepMemory["role"]): number {
  return _.filter(Game.creeps, (creep) => creep.memory.role === role).length;
}

export function nearestEnergyTarget(creep: Creep): StructureSpawn | StructureExtension | StructureTower | null {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) =>
      (structure.structureType === STRUCTURE_SPAWN ||
        structure.structureType === STRUCTURE_EXTENSION ||
        structure.structureType === STRUCTURE_TOWER) &&
      (structure as StructureSpawn | StructureExtension | StructureTower).store.getFreeCapacity(RESOURCE_ENERGY) > 0
  });

  if (!target) return null;
  return target as StructureSpawn | StructureExtension | StructureTower;
}

export function cleanupMemory(): void {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}
