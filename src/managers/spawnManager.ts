import { ROLE_BODIES } from "../config/bodyPlans";
import { COLONY_SETTINGS } from "../config/settings";
import { ROLE_ORDER, type RoleName } from "../config/roles";
import { getEmergencySoldierCount } from "./threatManager";
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

  const emergencySoldiers = getEmergencySoldierCount(spawn.room.name);
  if (emergencySoldiers > 0) {
    const soldierCount = current.filter((creep) => creep.memory.role === "soldier").length;
    if (soldierCount < emergencySoldiers) {
      return "soldier";
    }
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

function shouldBypassEnergyGate(spawn: StructureSpawn, role: RoleName): boolean {
  const current = Object.values(Game.creeps).filter((creep) => creep.memory.homeRoom === spawn.room.name);
  if (current.length === 0) return true;

  if (role === "harvester") {
    const harvesters = current.filter((creep) => creep.memory.role === "harvester").length;
    if (harvesters === 0) return true;
  }

  if (role === "hauler") {
    const haulers = current.filter((creep) => creep.memory.role === "hauler").length;
    if (haulers === 0) return true;
  }

  if (role === "soldier" && getEmergencySoldierCount(spawn.room.name) > 0) {
    return true;
  }

  return false;
}

function minimumEnergyForRole(spawn: StructureSpawn, role: RoleName): number {
  if (role !== "miner") return 0;
  // 550 energy allows miner body to reach 5 WORK for full source saturation.
  return Math.min(spawn.room.energyCapacityAvailable, 550);
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

function reinforcementNeedForRoom(roomName: string): number {
  const threat = Memory.threat?.[roomName];
  if (!threat || threat.expiresAt < Game.time) return 0;
  return getEmergencySoldierCount(roomName);
}

function currentDefendersAssigned(roomName: string): number {
  return Object.values(Game.creeps).filter((creep) => {
    if (creep.memory.role !== "soldier") return false;
    if (creep.memory.homeRoom === roomName) return true;
    return creep.memory.targetRoom === roomName;
  }).length;
}

function pickReinforcementTarget(homeRoom: string): string | undefined {
  const candidateRooms = Object.values(Game.rooms).filter((room) => room.controller?.my && room.name !== homeRoom);
  let bestTarget: string | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const room of candidateRooms) {
    const need = reinforcementNeedForRoom(room.name);
    if (need <= 0) continue;

    const assigned = currentDefendersAssigned(room.name);
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

    const localEmergency = getEmergencySoldierCount(spawn.room.name);
    const reinforcementTargetRoom =
      role === "soldier" && localEmergency === 0 ? pickReinforcementTarget(spawn.room.name) : undefined;

    const targetRoom = bootstrapTargetRoom ?? reinforcementTargetRoom;

    const reserveRatio = Math.max(0, Math.min(0.95, COLONY_SETTINGS.spawn.reserveEnergyRatio));
    const minFillRatio = 1 - reserveRatio;
    const requiredEnergy = Math.ceil(spawn.room.energyCapacityAvailable * minFillRatio);
    const roleMinEnergy = minimumEnergyForRole(spawn, role);
    const bypassEnergyGate = shouldBypassEnergyGate(spawn, role);
    if (!bypassEnergyGate && spawn.room.energyAvailable < Math.max(requiredEnergy, roleMinEnergy)) continue;

    const energyBudget = spawn.room.energyAvailable;
    const body = buildBody(role, energyBudget);
    if (!body) continue;

    const name = `${role}-${spawn.room.name}-${Game.time}`;
    spawn.spawnCreep(body, name, {
      memory: {
        role,
        homeRoom: spawn.room.name,
        working: false,
        targetRoom
      }
    });
  }
}
