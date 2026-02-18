import { harvestEnergy, pickupDroppedEnergy, withdrawStoredEnergy } from "../tasks/energy";

type WorkingResourceMode = ResourceConstant | "any";

export function updateWorkingState(creep: Creep, mode: WorkingResourceMode = RESOURCE_ENERGY): void {
  const usedCapacity = mode === "any" ? creep.store.getUsedCapacity() : creep.store.getUsedCapacity(mode);
  if (creep.memory.working && usedCapacity === 0) {
    creep.memory.working = false;
  }

  if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }
}

export function acquireEnergy(creep: Creep): boolean {
  return withdrawStoredEnergy(creep) || pickupDroppedEnergy(creep) || harvestEnergy(creep);
}
