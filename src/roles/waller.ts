import { fortifyDefenses, upgradeController } from "../tasks/work";
import { updateWorkingState, acquireEnergy } from "./common";

function wallHitTarget(room: Room): number {
  const rcl = room.controller?.level ?? 1;
  return rcl >= 8 ? 2000000 : rcl >= 6 ? 500000 : 100000;
}

export function runWaller(creep: Creep): void {
  updateWorkingState(creep);

  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }

  if (fortifyDefenses(creep, wallHitTarget(creep.room))) return;
  upgradeController(creep);
}
