import type { ColonyStage } from "./colonyStages";
import type { RoleName } from "./roles";

type RoleTargetOverrides = Partial<Record<RoleName, number>>;

export interface RoomControlSettings {
  roleTargets?: RoleTargetOverrides;
  roleTargetsByStage?: Partial<Record<ColonyStage, RoleTargetOverrides>>;
  disablePvP?: boolean;
  noAttackRooms?: string[];
  remoteRoomAllowlist?: string[];
  remoteRoomBlocklist?: string[];
}

interface ResolvedRoomControlSettings {
  roleTargets: RoleTargetOverrides;
  roleTargetsByStage: Partial<Record<ColonyStage, RoleTargetOverrides>>;
  disablePvP: boolean;
  noAttackRooms: string[];
  remoteRoomAllowlist?: string[];
  remoteRoomBlocklist: string[];
}

export const COLONY_SETTINGS = {
  pvp: {
    enabled: false,
    noAttackRooms: [] as string[]
  },
  combat: {
    offenseEnabled: false,
    defenseEnabled: true,
    defendEvenIfOffenseDisabled: true,
    threatDecayTicks: 30,
    lowThreatScore: 20,
    mediumThreatScore: 60,
    highThreatScore: 120,
    criticalThreatScore: 220,
    emergencySoldiersAtMedium: 1,
    emergencySoldiersAtHigh: 2,
    emergencySoldiersAtCritical: 4,
    safeModeThreatLevel: "critical" as "none" | "low" | "medium" | "high" | "critical"
  },
  stage: {
    towersMinRcl: 3,
    wallsMinRcl: 4,
    remoteMiningMinRcl: 3,
    remoteMiningMinEnergyCapacity: 800,
    expansionMinRcl: 4,
    offenseMinRcl: 6,
    offenseMinStorageEnergy: 100000
  },
  planner: {
    minHarvesters: 2,
    baseHaulers: 1,
    haulersPerSource: 1,
    baseUpgraders: 1,
    buildersWhenSitesExist: 2,
    buildersWhenNoSites: 1,
    heavyBuildSiteThreshold: 5,
    heavyBuilderCount: 3,
    upgradersByStage: {
      bootstrap: 1,
      early: 2,
      mid: 3,
      late: 3
    } as Record<ColonyStage, number>,
    repairersWhenEstablished: 1,
    scoutCount: 1,
    reserverCount: 1,
    claimerCount: 1,
    minSoldiers: 2,
    hostilesPerSoldier: 2
  },
  spawn: {
    reserveEnergyRatio: 0.3
  },
  construction: {
    runInterval: 37,
    maxRoomConstructionSites: 10,
    autoPlaceSpawnInClaimedRooms: true,
    sourceExtensionsPerSource: 2,
    sourceExtensionsMinRcl: 3,
    requireEnergyCapForSourceExtensions: true,
    sourceExtensionMaxAvgFillRatioToExpand: 0.4
  },
  defense: {
    wallRepairCap: 200000,
    structureRepairCap: 300000
  },
  walls: {
    targetHitsByRcl: {
      1: 5000,
      2: 20000,
      3: 100000,
      4: 100000,
      5: 200000,
      6: 500000,
      7: 1000000,
      8: 2000000
    } as Record<number, number>
  },
  energy: {
    pickupDroppedEnergyMinAmount: 50,
    haulerContainerWithdrawMinEnergy: 100
  },
  minerals: {
    enabled: true,
    minRcl: 6,
    requireStorage: true,
    minerCount: 1,
    haulerCount: 1,
    containerWithdrawMin: 50,
    allowTerminalFallback: true,
    allowContainerFallback: true
  },
  movement: {
    maxRoomsPerPath: 16,
    defaultRange: 1
  },
  logistics: {
    coreDeliveryRangeFromSpawn: 8
  },
  links: {
    enabled: true,
    minRcl: 5,
    senderMinEnergy: 400,
    receiverMinFreeCapacity: 200,
    controllerLinkTargetLevel: 600
  },
  telemetry: {
    enabled: true,
    interval: 50
  },
  layout: {
    scanMin: 6,
    scanMax: 43,
    minEdgeDistance: 4,
    desiredControllerRange: 8,
    desiredSourceRange: 8
  },
  expansion: {
    autoClaimNeighbors: false,
    maxConcurrentBootstrapRoomsPerHome: 1,
    bootstrapperCountPerTargetRoom: 2,
    manualClaimTargetsByRoom: {
      E18N7: []
    } as Record<string, string[]>
  },
  roleTargets: {
    default: {} as RoleTargetOverrides,
    byStage: {
      bootstrap: {},
      early: {},
      mid: {},
      late: {}
    } as Record<ColonyStage, RoleTargetOverrides>
  },
  rooms: {
    // Example:
    // W1N1: {
    //   disablePvP: true,
    //   noAttackRooms: ["W1N2"],
    //   roleTargets: { upgrader: 3, builder: 2 },
    //   roleTargetsByStage: { mid: { reserver: 2 } }
    // }
  } as Record<string, RoomControlSettings>
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function resolveRoomSettings(roomName: string): ResolvedRoomControlSettings {
  const roomSettings = COLONY_SETTINGS.rooms[roomName];

  return {
    roleTargets: roomSettings?.roleTargets ?? {},
    roleTargetsByStage: roomSettings?.roleTargetsByStage ?? {},
    disablePvP: roomSettings?.disablePvP ?? false,
    noAttackRooms: unique([...(COLONY_SETTINGS.pvp.noAttackRooms ?? []), ...(roomSettings?.noAttackRooms ?? [])]),
    remoteRoomAllowlist: roomSettings?.remoteRoomAllowlist,
    remoteRoomBlocklist: roomSettings?.remoteRoomBlocklist ?? []
  };
}

export function isAttackAllowed(homeRoom: string, targetRoom: string): boolean {
  const roomSettings = resolveRoomSettings(homeRoom);
  const offenseEnabled = COLONY_SETTINGS.combat.offenseEnabled && COLONY_SETTINGS.pvp.enabled;
  if (!offenseEnabled || roomSettings.disablePvP) return false;
  return !roomSettings.noAttackRooms.includes(targetRoom);
}

export function isRemoteRoomAllowed(homeRoom: string, targetRoom: string): boolean {
  const roomSettings = resolveRoomSettings(homeRoom);
  if (roomSettings.remoteRoomBlocklist.includes(targetRoom)) return false;
  if (roomSettings.remoteRoomAllowlist && roomSettings.remoteRoomAllowlist.length > 0) {
    return roomSettings.remoteRoomAllowlist.includes(targetRoom);
  }
  return true;
}

function isOwnedByMe(roomName: string): boolean {
  const room = Game.rooms[roomName];
  return Boolean(room?.controller?.my);
}

function hasMySpawn(roomName: string): boolean {
  const room = Game.rooms[roomName];
  if (!room?.controller?.my) return false;
  return room.find(FIND_MY_SPAWNS).length > 0;
}

export function getManualClaimTargets(homeRoom: string): string[] {
  return unique(COLONY_SETTINGS.expansion.manualClaimTargetsByRoom[homeRoom] ?? []);
}

function ensureExpansionState(homeRoom: string): Record<string, "pendingClaim" | "claimedNoSpawn" | "spawnEstablished"> {
  if (!Memory.expansionState) {
    Memory.expansionState = {};
  }

  if (!Memory.expansionState[homeRoom]) {
    Memory.expansionState[homeRoom] = {};
  }

  return Memory.expansionState[homeRoom];
}

function inferExpansionState(targetRoom: string): "pendingClaim" | "claimedNoSpawn" | "spawnEstablished" | null {
  const room = Game.rooms[targetRoom];
  if (!room?.controller) return null;
  if (!room.controller.my) return "pendingClaim";
  return room.find(FIND_MY_SPAWNS).length > 0 ? "spawnEstablished" : "claimedNoSpawn";
}

export function syncExpansionStateForHome(homeRoom: string): void {
  const state = ensureExpansionState(homeRoom);
  const targets = getManualClaimTargets(homeRoom);

  for (const targetRoom of targets) {
    if (!state[targetRoom]) {
      state[targetRoom] = "pendingClaim";
    }

    const inferred = inferExpansionState(targetRoom);
    if (!inferred) continue;
    state[targetRoom] = inferred;
  }
}

export function markManualTargetClaimed(homeRoom: string, targetRoom: string): void {
  const state = ensureExpansionState(homeRoom);
  state[targetRoom] = "claimedNoSpawn";
}

export function getPendingManualClaimTargets(homeRoom: string): string[] {
  syncExpansionStateForHome(homeRoom);
  const state = ensureExpansionState(homeRoom);
  return getManualClaimTargets(homeRoom).filter((roomName) => state[roomName] === "pendingClaim");
}

export function getBootstrapTargetRooms(homeRoom: string): string[] {
  syncExpansionStateForHome(homeRoom);
  const state = ensureExpansionState(homeRoom);
  const targets = getManualClaimTargets(homeRoom).filter((roomName) => state[roomName] === "claimedNoSpawn");
  const limit = Math.max(0, COLONY_SETTINGS.expansion.maxConcurrentBootstrapRoomsPerHome);
  if (limit === 0) return [];
  return targets.slice(0, limit);
}

export function getWallTargetHits(rcl: number): number {
  const target = COLONY_SETTINGS.walls.targetHitsByRcl[rcl];
  if (target) return target;
  return rcl >= 8 ? COLONY_SETTINGS.walls.targetHitsByRcl[8] : COLONY_SETTINGS.walls.targetHitsByRcl[1];
}
