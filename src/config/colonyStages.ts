export type ColonyStage = "bootstrap" | "early" | "mid" | "late";

export interface StageThresholdConfig {
  stage: ColonyStage;
  minRcl: number;
  minEnergyCapacity: number;
}

export const STAGE_THRESHOLDS: StageThresholdConfig[] = [
  { stage: "late", minRcl: 6, minEnergyCapacity: 1800 },
  { stage: "mid", minRcl: 4, minEnergyCapacity: 800 },
  { stage: "early", minRcl: 2, minEnergyCapacity: 450 },
  { stage: "bootstrap", minRcl: 0, minEnergyCapacity: 0 }
];

export interface CapabilityFlags {
  allowRoads: boolean;
  allowTowers: boolean;
  allowWalls: boolean;
  allowRemoteMining: boolean;
  allowExpansion: boolean;
  allowOffense: boolean;
}
