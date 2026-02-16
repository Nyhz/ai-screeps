import { upgradeController } from "../tasks/work";
import { updateWorkingState, acquireEnergy } from "./common";

export function runUpgrader(creep: Creep): void {
  updateWorkingState(creep);

  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }

  upgradeController(creep);
}
