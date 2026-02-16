import { harvestEnergy, pickupDroppedEnergy, withdrawStoredEnergy } from "../tasks/energy";

export function updateWorkingState(creep: Creep): void {
  if (creep.memory.working && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.working = false;
  }

  if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }
}

export function acquireEnergy(creep: Creep): boolean {
  return withdrawStoredEnergy(creep) || pickupDroppedEnergy(creep) || harvestEnergy(creep);
}
