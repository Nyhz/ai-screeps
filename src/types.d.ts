export {};

type RoleName =
  | "harvester"
  | "hauler"
  | "miner"
  | "mineralMiner"
  | "mineralHauler"
  | "upgrader"
  | "builder"
  | "repairer"
  | "waller"
  | "scout"
  | "reserver"
  | "claimer"
  | "bootstrapper"
  | "soldier";

type ColonyStage = "bootstrap" | "early" | "mid" | "late";

declare global {
  interface CreepMemory {
    role: RoleName;
    homeRoom: string;
    working?: boolean;
    sourceId?: Id<Source>;
    targetRoom?: string;
  }

  interface RoomStrategyMemory {
    stage: ColonyStage;
    capabilities: {
      allowRoads: boolean;
      allowTowers: boolean;
      allowWalls: boolean;
      allowRemoteMining: boolean;
      allowExpansion: boolean;
      allowOffense: boolean;
    };
    desiredRoles: Record<RoleName, number>;
    scoutTargetRooms: string[];
    reserveTargetRooms: string[];
    claimTargetRooms: string[];
    bootstrapTargetRooms: string[];
    attackTargetRooms: string[];
  }

  interface Memory {
    strategy?: Record<string, RoomStrategyMemory>;
    expansionState?: Record<string, Record<string, "pendingClaim" | "claimedNoSpawn" | "spawnEstablished">>;
    roomPlans?: Record<
      string,
      {
        anchorX: number;
        anchorY: number;
        score: number;
        createdAt: number;
      }
    >;
  }
}
