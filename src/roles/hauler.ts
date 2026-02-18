import { fillPriorityEnergyTargets, pickupDroppedEnergy, withdrawStoredEnergy } from "../tasks/energy";
import { COLONY_SETTINGS } from "../config/settings";
import { updateWorkingState } from "./common";

function withdrawFromSourceContainers(creep: Creep): boolean {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType !== STRUCTURE_CONTAINER) return false;
      const container = structure as StructureContainer;
      return container.store.getUsedCapacity(RESOURCE_ENERGY) >= COLONY_SETTINGS.energy.haulerContainerWithdrawMinEnergy;
    }
  }) as StructureContainer | null;

  if (!target) return false;

  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { reusePath: 15, visualizePathStyle: { stroke: "#219ebc" } });
    return true;
  }

  return result === OK;
}

export function runHauler(creep: Creep): void {
  updateWorkingState(creep);

  if (!creep.memory.working) {
    if (withdrawFromSourceContainers(creep)) return;
    if (withdrawStoredEnergy(creep)) return;
    pickupDroppedEnergy(creep);
    return;
  }

  fillPriorityEnergyTargets(creep);
}
