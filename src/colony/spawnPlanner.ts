import type { CapabilityFlags, ColonyStage } from "../config/colonyStages";
import { ROLE_ORDER, type RoleName } from "../config/roles";
import type { RoomSnapshot } from "./types";

function baseDesired(): Record<RoleName, number> {
  const desired = {} as Record<RoleName, number>;
  for (const role of ROLE_ORDER) {
    desired[role] = 0;
  }
  return desired;
}

export function deriveDesiredRoles(
  snapshot: RoomSnapshot,
  stage: ColonyStage,
  capabilities: CapabilityFlags
): Record<RoleName, number> {
  const desired = baseDesired();

  // Always keep a minimum survival workforce so a room can recover from wipes.
  desired.harvester = Math.max(2, snapshot.sourceCount);
  desired.hauler = 1;
  desired.upgrader = 1;
  desired.builder = snapshot.constructionSiteCount > 0 ? 2 : 1;

  if (stage !== "bootstrap") {
    desired.miner = snapshot.sourceCount;
    desired.hauler = Math.max(desired.hauler, snapshot.sourceCount);
    desired.upgrader = stage === "early" ? 2 : 3;
    desired.builder = snapshot.constructionSiteCount > 5 ? 3 : desired.builder;
    desired.repairer = 1;
  }

  if (capabilities.allowWalls) {
    desired.waller = 1;
  }

  if (capabilities.allowRemoteMining) {
    desired.scout = 1;
    desired.reserver = 1;
  }

  if (capabilities.allowExpansion) {
    desired.claimer = 1;
  }

  if (capabilities.allowOffense) {
    desired.soldier = Math.max(2, Math.ceil(snapshot.hostileCount / 2));
  }

  return desired;
}
