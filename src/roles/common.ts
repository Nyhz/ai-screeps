import { harvestEnergy, pickupDroppedEnergy, withdrawStoredEnergy } from "../tasks/energy";

type WorkingResourceMode = ResourceConstant | "any";

export function updateWorkingState(
  creep: Creep,
  mode: WorkingResourceMode = RESOURCE_ENERGY,
  startWorkingAtUsedCapacity?: number
): void {
  const usedCapacity = mode === "any" ? creep.store.getUsedCapacity() : creep.store.getUsedCapacity(mode);
  if (creep.memory.working && usedCapacity === 0) {
    creep.memory.working = false;
  }

  const isFullForMode =
    mode === "any" ? creep.store.getFreeCapacity() === 0 : creep.store.getFreeCapacity(mode) === 0;
  const shouldStartWithPartialLoad =
    startWorkingAtUsedCapacity !== undefined && usedCapacity >= Math.max(1, startWorkingAtUsedCapacity);

  if (!creep.memory.working && (isFullForMode || shouldStartWithPartialLoad)) {
    creep.memory.working = true;
  }
}

export function acquireEnergy(creep: Creep): boolean {
  return withdrawStoredEnergy(creep) || pickupDroppedEnergy(creep) || harvestEnergy(creep);
}
