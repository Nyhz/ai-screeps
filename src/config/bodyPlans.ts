import type { RoleName } from "./roles";

export interface BodyBlueprint {
  min: BodyPartConstant[];
  segment: BodyPartConstant[];
  maxSegments: number;
}

export const ROLE_BODIES: Record<RoleName, BodyBlueprint> = {
  harvester: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 6 },
  hauler: { min: [CARRY, CARRY, MOVE], segment: [CARRY, CARRY, MOVE], maxSegments: 8 },
  miner: { min: [WORK, WORK, WORK, CARRY, MOVE], segment: [WORK, MOVE], maxSegments: 6 },
  mineralMiner: { min: [WORK, WORK, CARRY, MOVE], segment: [WORK, WORK, MOVE], maxSegments: 4 },
  mineralHauler: { min: [CARRY, CARRY, MOVE], segment: [CARRY, CARRY, MOVE], maxSegments: 8 },
  upgrader: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 8 },
  builder: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 6 },
  repairer: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 5 },
  waller: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 7 },
  scout: { min: [MOVE], segment: [MOVE], maxSegments: 1 },
  reserver: { min: [CLAIM, MOVE], segment: [CLAIM, MOVE], maxSegments: 2 },
  claimer: { min: [CLAIM, MOVE], segment: [CLAIM, MOVE], maxSegments: 1 },
  bootstrapper: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 6 },
  soldier: { min: [TOUGH, MOVE, ATTACK, MOVE], segment: [TOUGH, MOVE, ATTACK, MOVE], maxSegments: 6 }
};
