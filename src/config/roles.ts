export const ROLE_ORDER = [
  "harvester",
  "hauler",
  "miner",
  "mineralMiner",
  "mineralHauler",
  "upgrader",
  "builder",
  "repairer",
  "waller",
  "scout",
  "reserver",
  "claimer",
  "bootstrapper",
  "soldier"
] as const;

export type RoleName = (typeof ROLE_ORDER)[number];

export const CORE_ROLES: RoleName[] = ["harvester", "hauler", "upgrader", "builder"];

export const COMBAT_ROLES: RoleName[] = ["soldier"];
