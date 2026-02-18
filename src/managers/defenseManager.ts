import { COLONY_SETTINGS } from "../config/settings";

export function runDefenseManager(): void {
  const towers = _.filter(
    Object.values(Game.structures),
    (structure): structure is StructureTower => structure.structureType === STRUCTURE_TOWER && structure.my
  );

  for (const tower of towers) {
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      continue;
    }

    const wounded = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: (creep: Creep) => creep.hits < creep.hitsMax
    });

    if (wounded) {
      tower.heal(wounded);
      continue;
    }

    const repairTarget = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure: Structure) => {
        if (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) {
          return structure.hits < COLONY_SETTINGS.defense.wallRepairCap;
        }

        return structure.hits < structure.hitsMax && structure.hits < COLONY_SETTINGS.defense.structureRepairCap;
      }
    });

    if (repairTarget) {
      tower.repair(repairTarget);
    }
  }
}
