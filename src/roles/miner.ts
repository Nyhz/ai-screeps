import { harvestEnergy } from "../tasks/energy";

function sourceContainer(creep: Creep): StructureContainer | null {
  const source = creep.memory.sourceId ? Game.getObjectById(creep.memory.sourceId) : null;
  if (!source) return null;

  const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (structure: Structure) => structure.structureType === STRUCTURE_CONTAINER
  }) as StructureContainer[];

  return containers[0] ?? null;
}

export function runMiner(creep: Creep): void {
  const container = sourceContainer(creep);
  if (container && creep.pos.getRangeTo(container) > 0) {
    creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: "#ffb703" } });
    return;
  }

  harvestEnergy(creep);
}
