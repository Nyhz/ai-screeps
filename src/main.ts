import { runBuilder } from "./roles/builder";
import { runHarvester } from "./roles/harvester";
import { runUpgrader } from "./roles/upgrader";
import { runRooms } from "./roomManager";
import { runSpawns } from "./spawnManager";
import { runTowers } from "./towerManager";
import { cleanupMemory } from "./utils";

function runCreep(creep: Creep): void {
  if (creep.memory.role === "harvester") {
    runHarvester(creep);
    return;
  }
  if (creep.memory.role === "upgrader") {
    runUpgrader(creep);
    return;
  }
  if (creep.memory.role === "builder") {
    runBuilder(creep);
  }
}

export const loop = (): void => {
  cleanupMemory();
  runRooms();
  runSpawns();
  runTowers();

  for (const name in Game.creeps) {
    runCreep(Game.creeps[name]);
  }
};
