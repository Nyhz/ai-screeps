import { runBuilder } from "./builder";
import { runBootstrapper } from "./bootstrapper";
import { runClaimer } from "./claimer";
import { runHarvester } from "./harvester";
import { runHauler } from "./hauler";
import { runMiner } from "./miner";
import { runMineralHauler } from "./mineralHauler";
import { runMineralMiner } from "./mineralMiner";
import { runRepairer } from "./repairer";
import { runReserver } from "./reserver";
import { runScout } from "./scout";
import { runSoldier } from "./soldier";
import { runUpgrader } from "./upgrader";
import { runWaller } from "./waller";

export function runRole(creep: Creep): void {
  switch (creep.memory.role) {
    case "harvester":
      runHarvester(creep);
      return;
    case "hauler":
      runHauler(creep);
      return;
    case "miner":
      runMiner(creep);
      return;
    case "mineralMiner":
      runMineralMiner(creep);
      return;
    case "mineralHauler":
      runMineralHauler(creep);
      return;
    case "upgrader":
      runUpgrader(creep);
      return;
    case "builder":
      runBuilder(creep);
      return;
    case "bootstrapper":
      runBootstrapper(creep);
      return;
    case "repairer":
      runRepairer(creep);
      return;
    case "waller":
      runWaller(creep);
      return;
    case "scout":
      runScout(creep);
      return;
    case "reserver":
      runReserver(creep);
      return;
    case "claimer":
      runClaimer(creep);
      return;
    case "soldier":
      runSoldier(creep);
      return;
  }
}
