import { moveToRoomCenter, moveToTarget } from "../tasks/movement";
import { fillPriorityEnergyTargets } from "../tasks/energy";
import { buildNearestSite, upgradeController } from "../tasks/work";
import { acquireEnergy, updateWorkingState } from "./common";

function buildSpawnFirst(creep: Creep): boolean {
  const spawnSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site: ConstructionSite) => site.structureType === STRUCTURE_SPAWN
  });

  if (!spawnSite) return false;

  const result = creep.build(spawnSite);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, spawnSite);
    return true;
  }

  return result === OK;
}

export function runBootstrapper(creep: Creep): void {
  const targetRoom = creep.memory.targetRoom;
  if (!targetRoom) return;

  if (creep.room.name !== targetRoom) {
    moveToRoomCenter(creep, targetRoom);
    return;
  }

  updateWorkingState(creep);

  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }

  if (buildSpawnFirst(creep)) return;
  if (buildNearestSite(creep)) return;
  if (fillPriorityEnergyTargets(creep)) return;
  upgradeController(creep);
}
