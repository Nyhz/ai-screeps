import { COLONY_SETTINGS } from "../config/settings";
import { moveToTarget } from "./movement";

function nonEnergyResourcesInStore(store: StoreDefinition): ResourceConstant[] {
  const keys = Object.keys(store) as ResourceConstant[];
  return keys.filter((resource) => resource !== RESOURCE_ENERGY && store.getUsedCapacity(resource) > 0);
}

export function roomMineral(room: Room): Mineral | null {
  return room.find(FIND_MINERALS)[0] ?? null;
}

export function roomMineralExtractor(room: Room): StructureExtractor | null {
  const mineral = roomMineral(room);
  if (!mineral) return null;

  const structure = mineral.pos
    .lookFor(LOOK_STRUCTURES)
    .find((entry) => entry.structureType === STRUCTURE_EXTRACTOR) as StructureExtractor | undefined;

  return structure ?? null;
}

export function roomMineralContainer(room: Room): StructureContainer | null {
  const mineral = roomMineral(room);
  if (!mineral) return null;

  const containers = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (structure: Structure) => structure.structureType === STRUCTURE_CONTAINER
  }) as StructureContainer[];

  return containers[0] ?? null;
}

export function harvestMineral(creep: Creep): boolean {
  const mineral = roomMineral(creep.room);
  if (!mineral || mineral.mineralAmount <= 0) return false;

  const extractor = roomMineralExtractor(creep.room);
  if (!extractor || extractor.cooldown > 0) return false;

  const result = creep.harvest(mineral);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, mineral);
    return true;
  }

  return result === OK;
}

export function withdrawMineralsFromContainer(creep: Creep): boolean {
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType !== STRUCTURE_CONTAINER) return false;
      const store = (structure as StructureContainer).store;
      const nonEnergyAmount = store.getUsedCapacity() - store.getUsedCapacity(RESOURCE_ENERGY);
      return nonEnergyAmount >= COLONY_SETTINGS.minerals.containerWithdrawMin;
    }
  }) as StructureContainer | null;

  if (!container) return false;

  const resources = nonEnergyResourcesInStore(container.store);
  const resource = resources[0];
  if (!resource) return false;

  const result = creep.withdraw(container, resource);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, container);
    return true;
  }

  return result === OK;
}

export function pickupDroppedMinerals(creep: Creep): boolean {
  const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (resource: Resource) => resource.resourceType !== RESOURCE_ENERGY && resource.amount > 0
  });

  if (!dropped) return false;

  const result = creep.pickup(dropped);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, dropped);
    return true;
  }

  return result === OK;
}

export function transferCarriedMinerals(creep: Creep): boolean {
  const target =
    creep.room.storage ??
    (COLONY_SETTINGS.minerals.allowTerminalFallback ? creep.room.terminal : null) ??
    (COLONY_SETTINGS.minerals.allowContainerFallback
      ? (creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure: Structure) => structure.structureType === STRUCTURE_CONTAINER
        }) as StructureContainer | null)
      : null);

  if (!target) return false;

  const resources = nonEnergyResourcesInStore(creep.store);
  const resource = resources[0];
  if (!resource) return false;

  const result = creep.transfer(target, resource);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
    return true;
  }

  return result === OK;
}
