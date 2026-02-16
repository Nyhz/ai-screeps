export {};

type RoleName =
  | "harvester"
  | "hauler"
  | "miner"
  | "upgrader"
  | "builder"
  | "repairer"
  | "waller"
  | "scout"
  | "reserver"
  | "claimer"
  | "soldier";

type ColonyStage = "bootstrap" | "early" | "mid" | "late";

declare global {
  interface CreepMemory {
    role: RoleName;
    homeRoom: string;
    working?: boolean;
    sourceId?: Id<Source>;
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
    attackTargetRooms: string[];
  }

  interface Memory {
    strategy?: Record<string, RoomStrategyMemory>;
  }
}
