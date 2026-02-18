import { upgradeController } from "../tasks/work";
import { updateWorkingState, acquireEnergy } from "./common";

export function runUpgrader(creep: Creep): void {
  // Prevent idling with partial energy loads.
  updateWorkingState(creep, RESOURCE_ENERGY, 1);

  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }

  upgradeController(creep);
}
