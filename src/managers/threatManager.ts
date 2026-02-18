import { COLONY_SETTINGS } from "../config/settings";

function partWeight(part: BodyPartConstant): number {
  switch (part) {
    case ATTACK:
      return 12;
    case RANGED_ATTACK:
      return 14;
    case HEAL:
      return 18;
    case WORK:
      return 6;
    case TOUGH:
      return 2;
    case MOVE:
      return 1;
    default:
      return 0;
  }
}

function scoreHostile(hostile: Creep): {
  score: number;
  attackParts: number;
  rangedParts: number;
  healParts: number;
  workParts: number;
} {
  let score = 0;
  let attackParts = 0;
  let rangedParts = 0;
  let healParts = 0;
  let workParts = 0;

  for (const bodyPart of hostile.body) {
    if (bodyPart.hits <= 0) continue;
    score += partWeight(bodyPart.type);
    if (bodyPart.type === ATTACK) attackParts += 1;
    if (bodyPart.type === RANGED_ATTACK) rangedParts += 1;
    if (bodyPart.type === HEAL) healParts += 1;
    if (bodyPart.type === WORK) workParts += 1;
  }

  return { score, attackParts, rangedParts, healParts, workParts };
}

function threatLevelFromScore(score: number): ThreatLevel {
  if (score >= COLONY_SETTINGS.combat.criticalThreatScore) return "critical";
  if (score >= COLONY_SETTINGS.combat.highThreatScore) return "high";
  if (score >= COLONY_SETTINGS.combat.mediumThreatScore) return "medium";
  if (score >= COLONY_SETTINGS.combat.lowThreatScore) return "low";
  return "none";
}

function threatLevelRank(level: ThreatLevel): number {
  switch (level) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function ensureThreatMemory(): Record<
  string,
  {
    level: ThreatLevel;
    score: number;
    hostileCount: number;
    attackParts: number;
    rangedParts: number;
    healParts: number;
    workParts: number;
    expiresAt: number;
  }
> {
  if (!Memory.threat) {
    Memory.threat = {};
  }
  return Memory.threat;
}

function ensureRoomStateMemory(): Record<string, RoomLifecycleState> {
  if (!Memory.roomState) {
    Memory.roomState = {};
  }
  return Memory.roomState;
}

function setRoomState(room: Room, threatLevel: ThreatLevel): void {
  const roomState = ensureRoomStateMemory();

  if (threatLevel === "high" || threatLevel === "critical") {
    roomState[room.name] = "war";
    return;
  }

  if (threatLevel === "medium" || threatLevel === "low") {
    roomState[room.name] = "recovery";
    return;
  }

  const rcl = room.controller?.level ?? 0;
  if (rcl <= 1) {
    roomState[room.name] = "bootstrap";
  } else if (rcl <= 4) {
    roomState[room.name] = "developing";
  } else {
    roomState[room.name] = "mature";
  }
}

function refreshThreatForRoom(room: Room): void {
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  const threat = ensureThreatMemory();
  const existing = threat[room.name];

  if (hostiles.length === 0) {
    if (existing && existing.expiresAt > Game.time) {
      setRoomState(room, existing.level);
      return;
    }

    threat[room.name] = {
      level: "none",
      score: 0,
      hostileCount: 0,
      attackParts: 0,
      rangedParts: 0,
      healParts: 0,
      workParts: 0,
      expiresAt: Game.time
    };
    setRoomState(room, "none");
    return;
  }

  let score = 0;
  let attackParts = 0;
  let rangedParts = 0;
  let healParts = 0;
  let workParts = 0;

  for (const hostile of hostiles) {
    const hostileScore = scoreHostile(hostile);
    score += hostileScore.score;
    attackParts += hostileScore.attackParts;
    rangedParts += hostileScore.rangedParts;
    healParts += hostileScore.healParts;
    workParts += hostileScore.workParts;
  }

  const level = threatLevelFromScore(score);
  threat[room.name] = {
    level,
    score,
    hostileCount: hostiles.length,
    attackParts,
    rangedParts,
    healParts,
    workParts,
    expiresAt: Game.time + COLONY_SETTINGS.combat.threatDecayTicks
  };

  const requiredSafeModeLevel = COLONY_SETTINGS.combat.safeModeThreatLevel;
  if (
    threatLevelRank(level) >= threatLevelRank(requiredSafeModeLevel) &&
    room.controller &&
    !room.controller.safeMode &&
    room.controller.safeModeAvailable > 0 &&
    room.controller.safeModeCooldown === undefined
  ) {
    const hostileNearCriticalAssets = hostiles.some((hostile) => {
      const nearSpawn = room.find(FIND_MY_SPAWNS).some((spawn) => hostile.pos.getRangeTo(spawn) <= 3);
      const nearController = hostile.pos.getRangeTo(room.controller as StructureController) <= 3;
      return nearSpawn || nearController;
    });

    if (hostileNearCriticalAssets) {
      room.controller.activateSafeMode();
    }
  }

  setRoomState(room, level);
}

export function getEmergencySoldierCount(roomName: string): number {
  const threat = Memory.threat?.[roomName];
  if (!threat || threat.expiresAt < Game.time) return 0;

  switch (threat.level) {
    case "critical":
      return COLONY_SETTINGS.combat.emergencySoldiersAtCritical;
    case "high":
      return COLONY_SETTINGS.combat.emergencySoldiersAtHigh;
    case "medium":
      return COLONY_SETTINGS.combat.emergencySoldiersAtMedium;
    default:
      return 0;
  }
}

export function runThreatManager(): void {
  for (const room of Object.values(Game.rooms)) {
    if (!room.controller?.my) continue;
    refreshThreatForRoom(room);
  }
}
