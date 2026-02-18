import { ROLE_BODIES } from "../config/bodyPlans";
import { COLONY_SETTINGS } from "../config/settings";
import { ROLE_ORDER, type RoleName } from "../config/roles";
import { getAllCreeps, getCreepsByHomeRoom, getOwnedRooms } from "../runtime/tickCache";
import { bodyCost } from "../utils";
import { getEmergencySoldierCount } from "./threatManager";

type RoleCounts = Record<RoleName, number>;

function emptyRoleCounts(): RoleCounts {
  const counts = {} as RoleCounts;
  for (const role of ROLE_ORDER) {
    counts[role] = 0;
  }
  return counts;
}

function countRoles(creeps: Creep[]): RoleCounts {
  const counts = emptyRoleCounts();
  for (const creep of creeps) {
    counts[creep.memory.role] += 1;
  }
  return counts;
}

function effectiveRoleCount(
  role: RoleName,
  current: RoleCounts,
  planned: Partial<Record<RoleName, number>>
): number {
  return current[role] + (planned[role] ?? 0);
}

function totalEffectiveCount(current: RoleCounts, planned: Partial<Record<RoleName, number>>): number {
  let total = 0;
  for (const role of ROLE_ORDER) {
    total += effectiveRoleCount(role, current, planned);
  }
  return total;
}

function buildBody(role: RoleName, energyBudget: number): BodyPartConstant[] | null {
  const blueprint = ROLE_BODIES[role];
  const minCost = bodyCost(blueprint.min);
  if (energyBudget < minCost) return null;

  const body: BodyPartConstant[] = [...blueprint.min];
  const segmentCost = bodyCost(blueprint.segment);
  let currentCost = minCost;
  let segments = 1;

  while (
    segments < blueprint.maxSegments &&
    body.length + blueprint.segment.length <= 50 &&
    currentCost + segmentCost <= energyBudget
  ) {
    body.push(...blueprint.segment);
    currentCost += segmentCost;
    segments += 1;
  }

  return body;
}

function nextRoleToSpawn(
  spawn: StructureSpawn,
  currentRoleCounts: RoleCounts,
  plannedRoleCounts: Partial<Record<RoleName, number>>
): RoleName | null {
  const strategy = Memory.strategy?.[spawn.room.name];
  if (!strategy) return null;

  if (totalEffectiveCount(currentRoleCounts, plannedRoleCounts) === 0) {
    return "harvester";
  }

  const emergencySoldiers = getEmergencySoldierCount(spawn.room.name);
  if (emergencySoldiers > 0) {
    const soldierCount = effectiveRoleCount("soldier", currentRoleCounts, plannedRoleCounts);
    if (soldierCount < emergencySoldiers) {
      return "soldier";
    }
  }

  for (const role of ROLE_ORDER) {
    const desired = strategy.desiredRoles[role] ?? 0;
    if (desired <= 0) continue;

    const currentCount = effectiveRoleCount(role, currentRoleCounts, plannedRoleCounts);
    if (currentCount < desired) {
      return role;
    }
  }

  return null;
}

function shouldBypassEnergyGate(
  spawn: StructureSpawn,
  role: RoleName,
  currentRoleCounts: RoleCounts,
  plannedRoleCounts: Partial<Record<RoleName, number>>
): boolean {
  if (totalEffectiveCount(currentRoleCounts, plannedRoleCounts) === 0) return true;

  if (role === "harvester") {
    if (effectiveRoleCount("harvester", currentRoleCounts, plannedRoleCounts) === 0) return true;
  }

  if (role === "hauler") {
    if (effectiveRoleCount("hauler", currentRoleCounts, plannedRoleCounts) === 0) return true;
  }

  if (role === "soldier" && getEmergencySoldierCount(spawn.room.name) > 0) {
    return true;
  }

  return false;
}

function minimumEnergyForRole(spawn: StructureSpawn, role: RoleName): number {
  if (role !== "miner") return 0;
  // 400 energy is required for miner baseline body with 3 WORK.
  return Math.min(spawn.room.energyCapacityAvailable, 400);
}

function pickBootstrapTargetRoom(
  targets: string[],
  roomCreeps: Creep[],
  plannedByTarget: Record<string, number>
): string | undefined {
  if (targets.length === 0) return undefined;

  let bestTarget: string | undefined;
  let bestCount = Number.MAX_SAFE_INTEGER;

  for (const target of targets) {
    const currentCount = roomCreeps.filter(
      (creep) => creep.memory.role === "bootstrapper" && creep.memory.targetRoom === target
    ).length;
    const count = currentCount + (plannedByTarget[target] ?? 0);

    if (count < bestCount) {
      bestCount = count;
      bestTarget = target;
    }
  }

  return bestTarget;
}

function reinforcementNeedForRoom(roomName: string): number {
  const threat = Memory.threat?.[roomName];
  if (!threat || threat.expiresAt < Game.time) return 0;
  return getEmergencySoldierCount(roomName);
}

function currentDefendersAssigned(
  roomName: string,
  allCreeps: Creep[],
  plannedByTargetRoom: Record<string, number>
): number {
  const assigned = allCreeps.filter((creep) => {
    if (creep.memory.role !== "soldier") return false;
    if (creep.memory.homeRoom === roomName) return true;
    return creep.memory.targetRoom === roomName;
  }).length;

  return assigned + (plannedByTargetRoom[roomName] ?? 0);
}

function pickReinforcementTarget(
  homeRoom: string,
  allCreeps: Creep[],
  plannedByTargetRoom: Record<string, number>
): string | undefined {
  const candidateRooms = getOwnedRooms().filter((room) => room.name !== homeRoom);
  let bestTarget: string | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const room of candidateRooms) {
    const need = reinforcementNeedForRoom(room.name);
    if (need <= 0) continue;

    const assigned = currentDefendersAssigned(room.name, allCreeps, plannedByTargetRoom);
    const deficit = need - assigned;
    if (deficit <= 0) continue;

    const distance = Game.map.getRoomLinearDistance(homeRoom, room.name);
    const score = deficit * 100 - distance * 10;
    if (score > bestScore) {
      bestScore = score;
      bestTarget = room.name;
    }
  }

  return bestTarget;
}

function sourceIdsInHomeRoom(homeRoom: string): Id<Source>[] {
  const room = Game.rooms[homeRoom];
  if (!room) return [];
  return room.find(FIND_SOURCES).map((source) => source.id);
}

function assignedSourceWorkerCount(
  roomCreeps: Creep[],
  role: "miner" | "hauler",
  sourceId: Id<Source>,
  onlyLocked: boolean
): number {
  return roomCreeps.filter((creep) => {
    if (creep.memory.role !== role) return false;
    if (creep.memory.sourceId !== sourceId) return false;
    if (onlyLocked && !creep.memory.lockSource) return false;
    return true;
  }).length;
}

function pickDedicatedSource(
  homeRoom: string,
  role: "miner" | "hauler",
  desiredPerSource: number,
  onlyLocked: boolean,
  roomCreeps: Creep[]
): Id<Source> | undefined {
  const sourceIds = sourceIdsInHomeRoom(homeRoom);
  if (sourceIds.length === 0 || desiredPerSource <= 0) return undefined;

  let bestSourceId: Id<Source> | undefined;
  let bestCount = Number.MAX_SAFE_INTEGER;
  for (const sourceId of sourceIds) {
    const count = assignedSourceWorkerCount(roomCreeps, role, sourceId, onlyLocked);
    if (count < bestCount) {
      bestCount = count;
      bestSourceId = sourceId;
    }
  }

  if (bestCount >= desiredPerSource) return undefined;
  return bestSourceId;
}

function uniqueSpawnName(spawn: StructureSpawn, role: RoleName): string {
  const base = `${role}-${spawn.name}-${Game.time}`;
  if (!Game.creeps[base]) return base;

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const candidate = `${base}-${attempt}`;
    if (!Game.creeps[candidate]) return candidate;
  }

  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export function runSpawnManager(): void {
  const spawns = Object.values(Game.spawns);
  const allCreeps = getAllCreeps();
  const roomRoleCounts: Record<string, RoleCounts> = {};
  const plannedRoleCountsByRoom: Record<string, Partial<Record<RoleName, number>>> = {};
  const plannedBootstrappersByRoomTarget: Record<string, Record<string, number>> = {};
  const plannedDefendersByTargetRoom: Record<string, number> = {};

  for (const spawn of spawns) {
    if (spawn.spawning) continue;
    const strategy = Memory.strategy?.[spawn.room.name];
    if (!strategy) continue;

    const roomName = spawn.room.name;
    if (!roomRoleCounts[roomName]) {
      roomRoleCounts[roomName] = countRoles(getCreepsByHomeRoom(roomName));
    }
    if (!plannedRoleCountsByRoom[roomName]) {
      plannedRoleCountsByRoom[roomName] = {};
    }
    if (!plannedBootstrappersByRoomTarget[roomName]) {
      plannedBootstrappersByRoomTarget[roomName] = {};
    }

    const roomCreeps = getCreepsByHomeRoom(roomName);
    const role = nextRoleToSpawn(spawn, roomRoleCounts[roomName], plannedRoleCountsByRoom[roomName]);
    if (!role) continue;

    const bootstrapTargetRoom =
      role === "bootstrapper"
        ? pickBootstrapTargetRoom(
            strategy.bootstrapTargetRooms,
            roomCreeps,
            plannedBootstrappersByRoomTarget[roomName]
          )
        : undefined;
    if (role === "bootstrapper" && !bootstrapTargetRoom) continue;

    const localEmergency = getEmergencySoldierCount(roomName);
    const reinforcementTargetRoom =
      role === "soldier" && localEmergency === 0
        ? pickReinforcementTarget(roomName, allCreeps, plannedDefendersByTargetRoom)
        : undefined;

    const targetRoom = bootstrapTargetRoom ?? reinforcementTargetRoom;

    const reserveRatio = Math.max(0, Math.min(0.95, COLONY_SETTINGS.spawn.reserveEnergyRatio));
    const minFillRatio = 1 - reserveRatio;
    const requiredEnergy = Math.ceil(spawn.room.energyCapacityAvailable * minFillRatio);
    const roleMinEnergy = minimumEnergyForRole(spawn, role);
    const bypassEnergyGate = shouldBypassEnergyGate(
      spawn,
      role,
      roomRoleCounts[roomName],
      plannedRoleCountsByRoom[roomName]
    );
    if (!bypassEnergyGate && spawn.room.energyAvailable < Math.max(requiredEnergy, roleMinEnergy)) continue;

    const body = buildBody(role, spawn.room.energyAvailable);
    if (!body) continue;

    const sourceId =
      role === "miner"
        ? pickDedicatedSource(
            roomName,
            "miner",
            Math.max(1, COLONY_SETTINGS.planner.minersPerSource),
            false,
            roomCreeps
          )
        : role === "hauler"
          ? pickDedicatedSource(
              roomName,
              "hauler",
              Math.max(0, COLONY_SETTINGS.planner.dedicatedHaulersPerSource),
              true,
              roomCreeps
            )
          : undefined;
    const lockSource = sourceId !== undefined;

    const name = uniqueSpawnName(spawn, role);
    const result = spawn.spawnCreep(body, name, {
      memory: {
        role,
        homeRoom: roomName,
        working: false,
        targetRoom,
        sourceId,
        lockSource
      }
    });

    if (result === OK) {
      plannedRoleCountsByRoom[roomName][role] = (plannedRoleCountsByRoom[roomName][role] ?? 0) + 1;
      if (role === "bootstrapper" && targetRoom) {
        plannedBootstrappersByRoomTarget[roomName][targetRoom] =
          (plannedBootstrappersByRoomTarget[roomName][targetRoom] ?? 0) + 1;
      }
      if (role === "soldier" && targetRoom) {
        plannedDefendersByTargetRoom[targetRoom] = (plannedDefendersByTargetRoom[targetRoom] ?? 0) + 1;
      }
      continue;
    }

    if (result !== ERR_BUSY && result !== ERR_NOT_ENOUGH_ENERGY && result !== ERR_NAME_EXISTS) {
      console.log(`[spawn][${spawn.name}] failed role=${role} code=${result}`);
    }
  }
}
