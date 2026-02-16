import { repairInfrastructure, upgradeController } from "../tasks/work";
import { updateWorkingState, acquireEnergy } from "./common";

export function runRepairer(creep: Creep): void {
  updateWorkingState(creep);

  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }

  if (repairInfrastructure(creep)) return;
  upgradeController(creep);
}
