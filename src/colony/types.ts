import type { CapabilityFlags, ColonyStage } from "../config/colonyStages";
import type { RoleName } from "../config/roles";

export interface RoomSnapshot {
  roomName: string;
  rcl: number;
  energyAvailable: number;
  energyCapacityAvailable: number;
  sourceCount: number;
  constructionSiteCount: number;
  hostileCount: number;
  storageEnergy: number;
  structuresByType: Partial<Record<StructureConstant, number>>;
  creepsByRole: Record<RoleName, number>;
}

export interface ColonyStrategy {
  stage: ColonyStage;
  capabilities: CapabilityFlags;
  desiredRoles: Record<RoleName, number>;
  scoutTargetRooms: string[];
  reserveTargetRooms: string[];
  claimTargetRooms: string[];
  attackTargetRooms: string[];
}
