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
  construction: {
    runInterval: 37,
    maxRoomConstructionSites: 10
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
  movement: {
    maxRoomsPerPath: 16,
    defaultRange: 1
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
  if (!COLONY_SETTINGS.pvp.enabled || roomSettings.disablePvP) return false;
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

export function getWallTargetHits(rcl: number): number {
  const target = COLONY_SETTINGS.walls.targetHitsByRcl[rcl];
  if (target) return target;
  return rcl >= 8 ? COLONY_SETTINGS.walls.targetHitsByRcl[8] : COLONY_SETTINGS.walls.targetHitsByRcl[1];
}
