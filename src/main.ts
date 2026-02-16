import { runColonyManager } from "./managers/colonyManager";
import { runConstructionManager } from "./managers/constructionManager";
import { runDefenseManager } from "./managers/defenseManager";
import { runSpawnManager } from "./managers/spawnManager";
import { runRole } from "./roles";
import { cleanupMemory } from "./utils";

export const loop = (): void => {
  cleanupMemory();

  runColonyManager();
  runSpawnManager();
  runConstructionManager();
  runDefenseManager();

  for (const creep of Object.values(Game.creeps)) {
    runRole(creep);
  }
};
