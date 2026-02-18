import { runColonyManager } from "./managers/colonyManager";
import { runConstructionManager } from "./managers/constructionManager";
import { runDefenseManager } from "./managers/defenseManager";
import { runLinkManager } from "./managers/linkManager";
import { runSpawnManager } from "./managers/spawnManager";
import { runRole } from "./roles";
import { cleanupMemory } from "./utils";

export const loop = (): void => {
  cleanupMemory();

  runColonyManager();
  runSpawnManager();
  runConstructionManager();
  runLinkManager();
  runDefenseManager();

  for (const creep of Object.values(Game.creeps)) {
    runRole(creep);
  }
};
