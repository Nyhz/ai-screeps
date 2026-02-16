import { fillPriorityEnergyTargets } from "../tasks/energy";
import { upgradeController } from "../tasks/work";
import { updateWorkingState, acquireEnergy } from "./common";

export function runHarvester(creep: Creep): void {
  updateWorkingState(creep);

  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }

  if (fillPriorityEnergyTargets(creep)) return;
  upgradeController(creep);
}
