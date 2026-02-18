import { runColonyManager } from "./managers/colonyManager";
import { runConstructionManager } from "./managers/constructionManager";
import { runDefenseManager } from "./managers/defenseManager";
import { runLinkManager } from "./managers/linkManager";
import { runSpawnManager } from "./managers/spawnManager";
import { runTelemetryManager } from "./managers/telemetryManager";
import { runThreatManager } from "./managers/threatManager";
import { runRole } from "./roles";
import { cleanupMemory } from "./utils";

export const loop = (): void => {
  cleanupMemory();

  runThreatManager();
  runColonyManager();
  runSpawnManager();
  runConstructionManager();
  runLinkManager();
  runDefenseManager();
  runTelemetryManager();

  for (const creep of Object.values(Game.creeps)) {
    runRole(creep);
  }
};
