import { ROLE_BODIES } from "../config/bodyPlans";
import { ROLE_ORDER, type RoleName } from "../config/roles";
import { bodyCost } from "../utils";

function buildBody(role: RoleName, energyBudget: number): BodyPartConstant[] | null {
  const blueprint = ROLE_BODIES[role];
  const minCost = bodyCost(blueprint.min);
  if (energyBudget < minCost) return null;

  const body: BodyPartConstant[] = [...blueprint.min];
  const segmentCost = bodyCost(blueprint.segment);

  let segments = 1;
  while (
    segments < blueprint.maxSegments &&
    body.length + blueprint.segment.length <= 50 &&
    bodyCost(body) + segmentCost <= energyBudget
  ) {
    body.push(...blueprint.segment);
    segments += 1;
  }

  return body;
}

function nextRoleToSpawn(spawn: StructureSpawn): RoleName | null {
  const strategy = Memory.strategy?.[spawn.room.name];
  if (!strategy) return null;

  const current = Object.values(Game.creeps).filter((creep) => creep.memory.homeRoom === spawn.room.name);
  if (current.length === 0) {
    return "harvester";
  }

  for (const role of ROLE_ORDER) {
    const desired = strategy.desiredRoles[role] ?? 0;
    if (desired <= 0) continue;

    const currentCount = current.filter((creep) => creep.memory.role === role).length;
    if (currentCount < desired) {
      return role;
    }
  }

  return null;
}

function pickBootstrapTargetRoom(homeRoom: string, targets: string[]): string | undefined {
  if (targets.length === 0) return undefined;

  let bestTarget: string | undefined;
  let bestCount = Number.MAX_SAFE_INTEGER;

  for (const target of targets) {
    const count = Object.values(Game.creeps).filter(
      (creep) => creep.memory.homeRoom === homeRoom && creep.memory.role === "bootstrapper" && creep.memory.targetRoom === target
    ).length;

    if (count < bestCount) {
      bestCount = count;
      bestTarget = target;
    }
  }

  return bestTarget;
}

export function runSpawnManager(): void {
  const spawns = Object.values(Game.spawns);
  for (const spawn of spawns) {
    if (spawn.spawning) continue;

    const role = nextRoleToSpawn(spawn);
    if (!role) continue;
    const strategy = Memory.strategy?.[spawn.room.name];
    if (!strategy) continue;

    const bootstrapTargetRoom =
      role === "bootstrapper" ? pickBootstrapTargetRoom(spawn.room.name, strategy.bootstrapTargetRooms) : undefined;
    if (role === "bootstrapper" && !bootstrapTargetRoom) continue;

    const energyBudget = spawn.room.energyAvailable;
    const body = buildBody(role, energyBudget);
    if (!body) continue;

    const name = `${role}-${spawn.room.name}-${Game.time}`;
    spawn.spawnCreep(body, name, {
      memory: {
        role,
        homeRoom: spawn.room.name,
        working: false,
        targetRoom: bootstrapTargetRoom
      }
    });
  }
}
