import { getWallTargetHits } from "../config/settings";
import { fortifyDefenses, upgradeController } from "../tasks/work";
import { updateWorkingState, acquireEnergy } from "./common";

export function runWaller(creep: Creep): void {
  updateWorkingState(creep);

  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }

  const rcl = creep.room.controller?.level ?? 1;
  if (fortifyDefenses(creep, getWallTargetHits(rcl))) return;
  upgradeController(creep);
}
