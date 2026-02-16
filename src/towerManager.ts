export function runTowers(): void {
  const towers = _.filter(
    Object.values(Game.structures),
    (structure): structure is StructureTower => structure.structureType === STRUCTURE_TOWER
  );

  for (const tower of towers) {
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      continue;
    }

    const mostDamaged = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure: Structure) =>
        structure.hits < structure.hitsMax &&
        structure.hits < 200000 &&
        structure.structureType !== STRUCTURE_WALL
    });

    if (mostDamaged) {
      tower.repair(mostDamaged);
    }
  }
}
