import { isUpgradingPaused } from "../config/settings";
import { moveToTarget } from "./movement";

export function upgradeController(creep: Creep): boolean {
  const controller = creep.room.controller;
  if (!controller) return false;
  if (isUpgradingPaused(creep.room)) return false;

  const result = creep.upgradeController(controller);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, controller);
    return true;
  }

  return result === OK;
}

export function buildNearestSite(creep: Creep): boolean {
  const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
  if (!site) return false;

  const result = creep.build(site);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, site);
    return true;
  }

  return result === OK;
}

export function repairInfrastructure(creep: Creep): boolean {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.hits >= structure.hitsMax) return false;
      return structure.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER;
    }
  });

  if (!target) return false;

  const result = creep.repair(target);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
    return true;
  }

  return result === OK;
}

export function fortifyDefenses(creep: Creep, minWallHits: number): boolean {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure: Structure) => {
      if (structure.structureType !== STRUCTURE_WALL && structure.structureType !== STRUCTURE_RAMPART) return false;
      return structure.hits < minWallHits;
    }
  });

  if (!target) return false;

  const result = creep.repair(target);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
    return true;
  }

  return result === OK;
}
