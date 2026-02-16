import { moveToTarget } from "./movement";

function isSourceWorker(creep: Creep): boolean {
  return creep.memory.role === "harvester" || creep.memory.role === "miner";
}

function sourceLoad(roomName: string, sourceId: Id<Source>, excludeCreepName: string): number {
  let load = 0;

  for (const other of Object.values(Game.creeps)) {
    if (other.name === excludeCreepName) continue;
    if (other.memory.homeRoom !== roomName) continue;
    if (!isSourceWorker(other)) continue;
    if (other.memory.sourceId === sourceId) {
      load += 1;
    }
  }

  return load;
}

function assignSource(creep: Creep): Source | null {
  const sources = creep.room.find(FIND_SOURCES_ACTIVE);
  if (sources.length === 0) return null;

  if (!isSourceWorker(creep)) {
    if (creep.memory.sourceId) {
      const existing = Game.getObjectById(creep.memory.sourceId as Id<Source>);
      if (existing) return existing;
    }

    const nearest = creep.pos.findClosestByPath(sources) ?? sources[0];
    creep.memory.sourceId = nearest.id;
    return nearest;
  }

  const existing =
    creep.memory.sourceId !== undefined ? Game.getObjectById(creep.memory.sourceId as Id<Source>) : null;
  const shouldRebalance = Game.time % 25 === 0;
  if (existing && !shouldRebalance) {
    return existing;
  }

  let best: Source | null = null;
  let bestLoad = Number.MAX_SAFE_INTEGER;
  let bestRange = Number.MAX_SAFE_INTEGER;

  for (const source of sources) {
    const load = sourceLoad(creep.memory.homeRoom, source.id, creep.name);
    const range = creep.pos.getRangeTo(source);

    if (load < bestLoad || (load === bestLoad && range < bestRange)) {
      best = source;
      bestLoad = load;
      bestRange = range;
    }
  }

  const selected = best ?? sources[0];
  creep.memory.sourceId = selected.id;
  return selected;
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
