import { COLONY_SETTINGS } from "../config/settings";

function pickPriorityHostile(tower: StructureTower): Creep | null {
  const hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length === 0) return null;

  const healers = hostiles.filter((hostile) => hostile.getActiveBodyparts(HEAL) > 0);
  if (healers.length > 0) {
    return tower.pos.findClosestByRange(healers);
  }

  const ranged = hostiles.filter((hostile) => hostile.getActiveBodyparts(RANGED_ATTACK) > 0);
  if (ranged.length > 0) {
    return tower.pos.findClosestByRange(ranged);
  }

  const attackers = hostiles.filter((hostile) => hostile.getActiveBodyparts(ATTACK) > 0);
  if (attackers.length > 0) {
    return tower.pos.findClosestByRange(attackers);
  }

  const workers = hostiles.filter((hostile) => hostile.getActiveBodyparts(WORK) > 0);
  if (workers.length > 0) {
    return tower.pos.findClosestByRange(workers);
  }

  return tower.pos.findClosestByRange(hostiles);
}

function threatLevel(roomName: string): ThreatLevel {
  const threat = Memory.threat?.[roomName];
  if (!threat || threat.expiresAt < Game.time) return "none";
  return threat.level;
}

export function runDefenseManager(): void {
  const towers = _.filter(
    Object.values(Game.structures),
    (structure): structure is StructureTower => structure.structureType === STRUCTURE_TOWER && structure.my
  );

  for (const tower of towers) {
    const roomThreat = threatLevel(tower.room.name);
    const inCombat = roomThreat !== "none";

    const hostileTarget = roomThreat === "high" || roomThreat === "critical" ? pickPriorityHostile(tower) : tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (hostileTarget) {
      tower.attack(hostileTarget);
      continue;
    }

    const wounded = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: (creep: Creep) => creep.hits < creep.hitsMax
    });

    if (wounded) {
      tower.heal(wounded);
      continue;
    }

    if (inCombat) continue;

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
