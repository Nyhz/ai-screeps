import { nearestEnergyTarget } from "../utils";

export function runHarvester(creep: Creep): void {
  if (creep.store.getFreeCapacity() > 0) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (!source) return;

    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#f5c542" } });
    }
    return;
  }

  const target = nearestEnergyTarget(creep);
  if (!target) {
    const controller = creep.room.controller;
    if (!controller) return;
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" } });
    }
    return;
  }

  if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: "#42a5f5" } });
  }
}
