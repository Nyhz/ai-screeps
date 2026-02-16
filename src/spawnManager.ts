import { countRole } from "./utils";

const BODY_BY_ROLE: Record<CreepMemory["role"], BodyPartConstant[]> = {
  harvester: [WORK, WORK, CARRY, MOVE],
  upgrader: [WORK, CARRY, CARRY, MOVE, MOVE],
  builder: [WORK, CARRY, CARRY, MOVE, MOVE]
};

export function runSpawns(): void {
  const spawns = Object.values(Game.spawns);
  for (const spawn of spawns) {
    if (spawn.spawning) continue;

    const harvesterCount = countRole("harvester");
    const upgraderCount = countRole("upgrader");
    const builderCount = countRole("builder");

    const sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
    const targetBuilders = sites.length > 0 ? 2 : 1;

    let nextRole: CreepMemory["role"] | null = null;
    if (harvesterCount < 3) nextRole = "harvester";
    else if (upgraderCount < 3) nextRole = "upgrader";
    else if (builderCount < targetBuilders) nextRole = "builder";

    if (!nextRole) continue;

    const name = `${nextRole}-${Game.time}`;
    const body = BODY_BY_ROLE[nextRole];
    spawn.spawnCreep(body, name, { memory: { role: nextRole, working: false } });
  }
}
