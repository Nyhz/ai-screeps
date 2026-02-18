import { pickupDroppedMinerals, transferCarriedMinerals, withdrawMineralsFromContainer } from "../tasks/minerals";
import { updateWorkingState } from "./common";

export function runMineralHauler(creep: Creep): void {
  updateWorkingState(creep);

  if (!creep.memory.working) {
    if (withdrawMineralsFromContainer(creep)) return;
    pickupDroppedMinerals(creep);
    return;
  }

  transferCarriedMinerals(creep);
}
