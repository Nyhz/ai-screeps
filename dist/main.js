"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  loop: () => loop
});
module.exports = __toCommonJS(main_exports);

// src/config/roles.ts
var ROLE_ORDER = [
  "harvester",
  "hauler",
  "miner",
  "mineralMiner",
  "mineralHauler",
  "upgrader",
  "builder",
  "repairer",
  "waller",
  "scout",
  "reserver",
  "claimer",
  "bootstrapper",
  "soldier"
];

// src/colony/intel.ts
function emptyRoleCounts() {
  const counts = {};
  for (const role of ROLE_ORDER) {
    counts[role] = 0;
  }
  return counts;
}
function collectRoomSnapshot(room) {
  var _a, _b, _c, _d;
  const creepsByRole = emptyRoleCounts();
  for (const creep of Object.values(Game.creeps)) {
    if (creep.memory.homeRoom !== room.name) continue;
    creepsByRole[creep.memory.role] += 1;
  }
  const structures = room.find(FIND_STRUCTURES);
  const structuresByType = {};
  for (const structure of structures) {
    structuresByType[structure.structureType] = ((_a = structuresByType[structure.structureType]) != null ? _a : 0) + 1;
  }
  const storageEnergy = (_c = (_b = room.storage) == null ? void 0 : _b.store.getUsedCapacity(RESOURCE_ENERGY)) != null ? _c : 0;
  const controller = room.controller;
  return {
    roomName: room.name,
    rcl: (_d = controller == null ? void 0 : controller.level) != null ? _d : 0,
    energyAvailable: room.energyAvailable,
    energyCapacityAvailable: room.energyCapacityAvailable,
    sourceCount: room.find(FIND_SOURCES).length,
    constructionSiteCount: room.find(FIND_CONSTRUCTION_SITES).length,
    hostileCount: room.find(FIND_HOSTILE_CREEPS).length,
    storageEnergy,
    structuresByType,
    creepsByRole
  };
}

// src/config/settings.ts
var COLONY_SETTINGS = {
  pvp: {
    enabled: false,
    noAttackRooms: []
  },
  combat: {
    offenseEnabled: false,
    defenseEnabled: true,
    defendEvenIfOffenseDisabled: true,
    threatDecayTicks: 30,
    lowThreatScore: 20,
    mediumThreatScore: 60,
    highThreatScore: 120,
    criticalThreatScore: 220,
    emergencySoldiersAtMedium: 1,
    emergencySoldiersAtHigh: 2,
    emergencySoldiersAtCritical: 4,
    safeModeThreatLevel: "critical"
  },
  stage: {
    towersMinRcl: 3,
    wallsMinRcl: 4,
    remoteMiningMinRcl: 3,
    remoteMiningMinEnergyCapacity: 800,
    expansionMinRcl: 4,
    offenseMinRcl: 6,
    offenseMinStorageEnergy: 1e5
  },
  planner: {
    minHarvesters: 2,
    baseHaulers: 2,
    haulersPerSource: 1,
    baseUpgraders: 1,
    buildersWhenSitesExist: 2,
    buildersWhenNoSites: 1,
    heavyBuildSiteThreshold: 5,
    heavyBuilderCount: 3,
    upgradersByStage: {
      bootstrap: 1,
      early: 2,
      mid: 3,
      late: 3
    },
    repairersWhenEstablished: 1,
    scoutCount: 1,
    reserverCount: 1,
    claimerCount: 1,
    minSoldiers: 2,
    hostilesPerSoldier: 2
  },
  spawn: {
    reserveEnergyRatio: 0.3
  },
  upgrading: {
    pauseWhenStorageEnergyBelow: 1e4,
    pauseWhenNoStorageFillRatio: 0.7
  },
  construction: {
    runInterval: 37,
    maxRoomConstructionSites: 10,
    autoPlaceSpawnInClaimedRooms: true,
    sourceExtensionsPerSource: 2,
    sourceExtensionsMinRcl: 2,
    requireEnergyCapForSourceExtensions: false,
    sourceExtensionMaxAvgFillRatioToExpand: 0.4
  },
  defense: {
    wallRepairCap: 2e5,
    structureRepairCap: 3e5
  },
  walls: {
    targetHitsByRcl: {
      1: 5e3,
      2: 2e4,
      3: 1e5,
      4: 1e5,
      5: 2e5,
      6: 5e5,
      7: 1e6,
      8: 2e6
    }
  },
  energy: {
    pickupDroppedEnergyMinAmount: 50,
    haulerContainerWithdrawMinEnergy: 100
  },
  minerals: {
    enabled: true,
    minRcl: 6,
    requireStorage: true,
    minerCount: 1,
    haulerCount: 1,
    containerWithdrawMin: 50,
    allowTerminalFallback: true,
    allowContainerFallback: true
  },
  movement: {
    maxRoomsPerPath: 16,
    defaultRange: 1
  },
  logistics: {
    coreDeliveryRangeFromSpawn: 8
  },
  links: {
    enabled: true,
    minRcl: 5,
    senderMinEnergy: 400,
    receiverMinFreeCapacity: 200,
    controllerLinkTargetLevel: 600
  },
  telemetry: {
    enabled: true,
    interval: 50
  },
  layout: {
    scanMin: 6,
    scanMax: 43,
    minEdgeDistance: 4,
    desiredControllerRange: 8,
    desiredSourceRange: 8
  },
  expansion: {
    autoClaimNeighbors: false,
    maxConcurrentBootstrapRoomsPerHome: 1,
    bootstrapperCountPerTargetRoom: 2,
    manualClaimTargetsByRoom: {
      E18N7: []
    }
  },
  roleTargets: {
    default: {},
    byStage: {
      bootstrap: {},
      early: {},
      mid: {},
      late: {}
    }
  },
  rooms: {
    // Example:
    // W1N1: {
    //   disablePvP: true,
    //   noAttackRooms: ["W1N2"],
    //   roleTargets: { upgrader: 3, builder: 2 },
    //   roleTargetsByStage: { mid: { reserver: 2 } }
    // }
  }
};
function unique(values) {
  return [...new Set(values)];
}
function resolveRoomSettings(roomName) {
  var _a, _b, _c, _d, _e, _f;
  const roomSettings = COLONY_SETTINGS.rooms[roomName];
  return {
    roleTargets: (_a = roomSettings == null ? void 0 : roomSettings.roleTargets) != null ? _a : {},
    roleTargetsByStage: (_b = roomSettings == null ? void 0 : roomSettings.roleTargetsByStage) != null ? _b : {},
    disablePvP: (_c = roomSettings == null ? void 0 : roomSettings.disablePvP) != null ? _c : false,
    noAttackRooms: unique([...(_d = COLONY_SETTINGS.pvp.noAttackRooms) != null ? _d : [], ...(_e = roomSettings == null ? void 0 : roomSettings.noAttackRooms) != null ? _e : []]),
    remoteRoomAllowlist: roomSettings == null ? void 0 : roomSettings.remoteRoomAllowlist,
    remoteRoomBlocklist: (_f = roomSettings == null ? void 0 : roomSettings.remoteRoomBlocklist) != null ? _f : []
  };
}
function isAttackAllowed(homeRoom, targetRoom) {
  const roomSettings = resolveRoomSettings(homeRoom);
  const offenseEnabled = COLONY_SETTINGS.combat.offenseEnabled && COLONY_SETTINGS.pvp.enabled;
  if (!offenseEnabled || roomSettings.disablePvP) return false;
  return !roomSettings.noAttackRooms.includes(targetRoom);
}
function isRemoteRoomAllowed(homeRoom, targetRoom) {
  const roomSettings = resolveRoomSettings(homeRoom);
  if (roomSettings.remoteRoomBlocklist.includes(targetRoom)) return false;
  if (roomSettings.remoteRoomAllowlist && roomSettings.remoteRoomAllowlist.length > 0) {
    return roomSettings.remoteRoomAllowlist.includes(targetRoom);
  }
  return true;
}
function getManualClaimTargets(homeRoom) {
  var _a;
  return unique((_a = COLONY_SETTINGS.expansion.manualClaimTargetsByRoom[homeRoom]) != null ? _a : []);
}
function ensureExpansionState(homeRoom) {
  if (!Memory.expansionState) {
    Memory.expansionState = {};
  }
  if (!Memory.expansionState[homeRoom]) {
    Memory.expansionState[homeRoom] = {};
  }
  return Memory.expansionState[homeRoom];
}
function inferExpansionState(targetRoom) {
  const room = Game.rooms[targetRoom];
  if (!(room == null ? void 0 : room.controller)) return null;
  if (!room.controller.my) return "pendingClaim";
  return room.find(FIND_MY_SPAWNS).length > 0 ? "spawnEstablished" : "claimedNoSpawn";
}
function syncExpansionStateForHome(homeRoom) {
  const state = ensureExpansionState(homeRoom);
  const targets = getManualClaimTargets(homeRoom);
  for (const targetRoom of targets) {
    if (!state[targetRoom]) {
      state[targetRoom] = "pendingClaim";
    }
    const inferred = inferExpansionState(targetRoom);
    if (!inferred) continue;
    state[targetRoom] = inferred;
  }
}
function markManualTargetClaimed(homeRoom, targetRoom) {
  const state = ensureExpansionState(homeRoom);
  state[targetRoom] = "claimedNoSpawn";
}
function getPendingManualClaimTargets(homeRoom) {
  syncExpansionStateForHome(homeRoom);
  const state = ensureExpansionState(homeRoom);
  return getManualClaimTargets(homeRoom).filter((roomName) => state[roomName] === "pendingClaim");
}
function getBootstrapTargetRooms(homeRoom) {
  syncExpansionStateForHome(homeRoom);
  const state = ensureExpansionState(homeRoom);
  const targets = getManualClaimTargets(homeRoom).filter((roomName) => state[roomName] === "claimedNoSpawn");
  const limit = Math.max(0, COLONY_SETTINGS.expansion.maxConcurrentBootstrapRoomsPerHome);
  if (limit === 0) return [];
  return targets.slice(0, limit);
}
function getWallTargetHits(rcl) {
  const target = COLONY_SETTINGS.walls.targetHitsByRcl[rcl];
  if (target) return target;
  return rcl >= 8 ? COLONY_SETTINGS.walls.targetHitsByRcl[8] : COLONY_SETTINGS.walls.targetHitsByRcl[1];
}
function isUpgradingPaused(room) {
  const fillRatio = Math.max(0, Math.min(1, COLONY_SETTINGS.upgrading.pauseWhenNoStorageFillRatio));
  const requiredEnergy = Math.ceil(room.energyCapacityAvailable * fillRatio);
  const storageThreshold = Math.max(0, COLONY_SETTINGS.upgrading.pauseWhenStorageEnergyBelow);
  if (room.storage && storageThreshold > 0) {
    const storageEnergy = room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
    if (storageEnergy >= storageThreshold) return false;
    return room.energyAvailable < requiredEnergy;
  }
  return room.energyAvailable < requiredEnergy;
}

// src/managers/threatManager.ts
function partWeight(part) {
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
function scoreHostile(hostile) {
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
function threatLevelFromScore(score) {
  if (score >= COLONY_SETTINGS.combat.criticalThreatScore) return "critical";
  if (score >= COLONY_SETTINGS.combat.highThreatScore) return "high";
  if (score >= COLONY_SETTINGS.combat.mediumThreatScore) return "medium";
  if (score >= COLONY_SETTINGS.combat.lowThreatScore) return "low";
  return "none";
}
function threatLevelRank(level) {
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
function ensureThreatMemory() {
  if (!Memory.threat) {
    Memory.threat = {};
  }
  return Memory.threat;
}
function ensureRoomStateMemory() {
  if (!Memory.roomState) {
    Memory.roomState = {};
  }
  return Memory.roomState;
}
function setRoomState(room, threatLevel2) {
  var _a, _b;
  const roomState = ensureRoomStateMemory();
  if (threatLevel2 === "high" || threatLevel2 === "critical") {
    roomState[room.name] = "war";
    return;
  }
  if (threatLevel2 === "medium" || threatLevel2 === "low") {
    roomState[room.name] = "recovery";
    return;
  }
  const rcl = (_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0;
  if (rcl <= 1) {
    roomState[room.name] = "bootstrap";
  } else if (rcl <= 4) {
    roomState[room.name] = "developing";
  } else {
    roomState[room.name] = "mature";
  }
}
function refreshThreatForRoom(room) {
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
  if (threatLevelRank(level) >= threatLevelRank(requiredSafeModeLevel) && room.controller && !room.controller.safeMode && room.controller.safeModeAvailable > 0 && room.controller.safeModeCooldown === void 0) {
    const hostileNearCriticalAssets = hostiles.some((hostile) => {
      const nearSpawn = room.find(FIND_MY_SPAWNS).some((spawn) => hostile.pos.getRangeTo(spawn) <= 3);
      const nearController = hostile.pos.getRangeTo(room.controller) <= 3;
      return nearSpawn || nearController;
    });
    if (hostileNearCriticalAssets) {
      room.controller.activateSafeMode();
    }
  }
  setRoomState(room, level);
}
function getEmergencySoldierCount(roomName) {
  var _a;
  const threat = (_a = Memory.threat) == null ? void 0 : _a[roomName];
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
function runThreatManager() {
  var _a;
  for (const room of Object.values(Game.rooms)) {
    if (!((_a = room.controller) == null ? void 0 : _a.my)) continue;
    refreshThreatForRoom(room);
  }
}

// src/colony/spawnPlanner.ts
function baseDesired() {
  const desired = {};
  for (const role of ROLE_ORDER) {
    desired[role] = 0;
  }
  return desired;
}
function applyRoleOverrides(target, overrides) {
  for (const role of ROLE_ORDER) {
    const desired = overrides[role];
    if (desired === void 0) continue;
    target[role] = Math.max(0, desired);
  }
}
function shouldRunMineralPipeline(snapshot) {
  if (!COLONY_SETTINGS.minerals.enabled) return false;
  if (snapshot.rcl < COLONY_SETTINGS.minerals.minRcl) return false;
  const room = Game.rooms[snapshot.roomName];
  if (!room) return false;
  if (COLONY_SETTINGS.minerals.requireStorage && !room.storage) return false;
  const mineral = room.find(FIND_MINERALS)[0];
  return Boolean(mineral && mineral.mineralAmount > 0);
}
function shouldSpawnClaimer(snapshot) {
  if (COLONY_SETTINGS.expansion.autoClaimNeighbors) return true;
  return getPendingManualClaimTargets(snapshot.roomName).length > 0;
}
function deriveDesiredRoles(snapshot, stage, capabilities) {
  var _a, _b, _c, _d;
  const desired = baseDesired();
  const roomSettings = resolveRoomSettings(snapshot.roomName);
  const roomState = (_b = (_a = Memory.roomState) == null ? void 0 : _a[snapshot.roomName]) != null ? _b : "developing";
  desired.harvester = Math.max(COLONY_SETTINGS.planner.minHarvesters, snapshot.sourceCount);
  desired.hauler = COLONY_SETTINGS.planner.baseHaulers;
  desired.upgrader = COLONY_SETTINGS.planner.baseUpgraders;
  desired.builder = snapshot.constructionSiteCount > 0 ? COLONY_SETTINGS.planner.buildersWhenSitesExist : COLONY_SETTINGS.planner.buildersWhenNoSites;
  if (stage !== "bootstrap") {
    desired.harvester = Math.min(desired.harvester, 1);
    desired.miner = snapshot.sourceCount;
    desired.hauler = Math.max(
      desired.hauler,
      snapshot.sourceCount * COLONY_SETTINGS.planner.haulersPerSource,
      COLONY_SETTINGS.planner.baseHaulers
    );
    desired.upgrader = COLONY_SETTINGS.planner.upgradersByStage[stage];
    desired.builder = snapshot.constructionSiteCount > COLONY_SETTINGS.planner.heavyBuildSiteThreshold ? COLONY_SETTINGS.planner.heavyBuilderCount : desired.builder;
    desired.repairer = COLONY_SETTINGS.planner.repairersWhenEstablished;
  }
  if (capabilities.allowWalls) {
    desired.waller = 1;
  }
  if (capabilities.allowRemoteMining) {
    desired.scout = COLONY_SETTINGS.planner.scoutCount;
    desired.reserver = COLONY_SETTINGS.planner.reserverCount;
  }
  if (capabilities.allowExpansion && shouldSpawnClaimer(snapshot)) {
    desired.claimer = COLONY_SETTINGS.planner.claimerCount;
  }
  const bootstrapTargets = getBootstrapTargetRooms(snapshot.roomName);
  if (bootstrapTargets.length > 0) {
    desired.bootstrapper = bootstrapTargets.length * COLONY_SETTINGS.expansion.bootstrapperCountPerTargetRoom;
  }
  if (capabilities.allowOffense) {
    desired.soldier = Math.max(
      COLONY_SETTINGS.planner.minSoldiers,
      Math.ceil(snapshot.hostileCount / Math.max(1, COLONY_SETTINGS.planner.hostilesPerSoldier))
    );
  }
  if (shouldRunMineralPipeline(snapshot)) {
    desired.mineralMiner = COLONY_SETTINGS.minerals.minerCount;
    desired.mineralHauler = COLONY_SETTINGS.minerals.haulerCount;
  }
  const emergencySoldiers = getEmergencySoldierCount(snapshot.roomName);
  if (emergencySoldiers > 0) {
    desired.soldier = Math.max(desired.soldier, emergencySoldiers);
  }
  if (roomState === "war") {
    desired.upgrader = Math.min(desired.upgrader, 1);
    desired.builder = Math.min(desired.builder, 1);
    desired.hauler = Math.max(desired.hauler, snapshot.sourceCount + 1);
    desired.repairer = Math.max(desired.repairer, 2);
  } else if (roomState === "recovery") {
    desired.upgrader = Math.min(desired.upgrader, 2);
    desired.repairer = Math.max(desired.repairer, 1);
  }
  const room = Game.rooms[snapshot.roomName];
  if (room && isUpgradingPaused(room)) {
    desired.upgrader = 0;
  }
  applyRoleOverrides(desired, COLONY_SETTINGS.roleTargets.default);
  applyRoleOverrides(desired, (_c = COLONY_SETTINGS.roleTargets.byStage[stage]) != null ? _c : {});
  applyRoleOverrides(desired, roomSettings.roleTargets);
  applyRoleOverrides(desired, (_d = roomSettings.roleTargetsByStage[stage]) != null ? _d : {});
  return desired;
}

// src/config/colonyStages.ts
var STAGE_THRESHOLDS = [
  { stage: "late", minRcl: 6, minEnergyCapacity: 1800 },
  { stage: "mid", minRcl: 4, minEnergyCapacity: 800 },
  { stage: "early", minRcl: 2, minEnergyCapacity: 450 },
  { stage: "bootstrap", minRcl: 0, minEnergyCapacity: 0 }
];

// src/colony/stageManager.ts
function deriveStage(snapshot) {
  for (const threshold of STAGE_THRESHOLDS) {
    if (snapshot.rcl >= threshold.minRcl && snapshot.energyCapacityAvailable >= threshold.minEnergyCapacity) {
      return threshold.stage;
    }
  }
  return "bootstrap";
}
function ownedRoomCount() {
  return Object.values(Game.rooms).filter((room) => {
    var _a;
    return (_a = room.controller) == null ? void 0 : _a.my;
  }).length;
}
function canExpand(snapshot) {
  const gclLevel = Game.gcl.level;
  const myRooms = ownedRoomCount();
  return snapshot.rcl >= COLONY_SETTINGS.stage.expansionMinRcl && gclLevel > myRooms;
}
function canAttack(snapshot) {
  const roomSettings = resolveRoomSettings(snapshot.roomName);
  if (!COLONY_SETTINGS.combat.offenseEnabled || !COLONY_SETTINGS.pvp.enabled || roomSettings.disablePvP) return false;
  return snapshot.rcl >= COLONY_SETTINGS.stage.offenseMinRcl && snapshot.storageEnergy >= COLONY_SETTINGS.stage.offenseMinStorageEnergy;
}
function deriveCapabilities(snapshot, stage) {
  return {
    allowRoads: stage !== "bootstrap",
    allowTowers: snapshot.rcl >= COLONY_SETTINGS.stage.towersMinRcl,
    allowWalls: snapshot.rcl >= COLONY_SETTINGS.stage.wallsMinRcl,
    allowRemoteMining: snapshot.rcl >= COLONY_SETTINGS.stage.remoteMiningMinRcl && snapshot.energyCapacityAvailable >= COLONY_SETTINGS.stage.remoteMiningMinEnergyCapacity,
    allowExpansion: canExpand(snapshot),
    allowOffense: canAttack(snapshot)
  };
}
function deriveStageAndCapabilities(snapshot) {
  const stage = deriveStage(snapshot);
  const capabilities = deriveCapabilities(snapshot, stage);
  return { stage, capabilities };
}

// src/colony/strategyManager.ts
function unique2(values) {
  return [...new Set(values)];
}
function neighboringRooms(room) {
  const exits = Game.map.describeExits(room.name);
  if (!exits) return [];
  return unique2(Object.values(exits));
}
function deriveTargetRooms(room, strategy) {
  var _a;
  const visibleNeighbors = neighboringRooms(room);
  const allowedRemoteNeighbors = visibleNeighbors.filter((name) => isRemoteRoomAllowed(room.name, name));
  const scoutTargetRooms = visibleNeighbors;
  const reserveTargetRooms = strategy.capabilities.allowRemoteMining ? allowedRemoteNeighbors : [];
  const autoClaimTargetRooms = allowedRemoteNeighbors.filter((name) => {
    const targetRoom = Game.rooms[name];
    if (!(targetRoom == null ? void 0 : targetRoom.controller)) return true;
    return !targetRoom.controller.owner && !targetRoom.controller.reservation;
  });
  const manualClaimTargetRooms = getPendingManualClaimTargets(room.name);
  const bootstrapTargetRooms = getBootstrapTargetRooms(room.name);
  const desiredClaimList = COLONY_SETTINGS.expansion.autoClaimNeighbors ? autoClaimTargetRooms : manualClaimTargetRooms;
  const claimTargetRooms = strategy.capabilities.allowExpansion && desiredClaimList.length > 0 ? [desiredClaimList[0]] : [];
  const attackTargetRooms = strategy.capabilities.allowOffense ? visibleNeighbors.filter((name) => {
    if (!isAttackAllowed(room.name, name)) return false;
    const targetRoom = Game.rooms[name];
    if (!targetRoom) return false;
    return targetRoom.find(FIND_HOSTILE_CREEPS).length > 0;
  }) : [];
  const localThreat = (_a = Memory.threat) == null ? void 0 : _a[room.name];
  const shouldDefendLocalRoom = COLONY_SETTINGS.combat.defenseEnabled && localThreat !== void 0 && localThreat.expiresAt >= Game.time && localThreat.level !== "none";
  if (shouldDefendLocalRoom && !attackTargetRooms.includes(room.name)) {
    attackTargetRooms.unshift(room.name);
  }
  return {
    ...strategy,
    scoutTargetRooms,
    reserveTargetRooms,
    claimTargetRooms,
    bootstrapTargetRooms,
    attackTargetRooms
  };
}

// src/managers/colonyManager.ts
function runColonyManager() {
  var _a;
  for (const room of Object.values(Game.rooms)) {
    if (!((_a = room.controller) == null ? void 0 : _a.my)) continue;
    syncExpansionStateForHome(room.name);
    const snapshot = collectRoomSnapshot(room);
    const { stage, capabilities } = deriveStageAndCapabilities(snapshot);
    const desiredRoles = deriveDesiredRoles(snapshot, stage, capabilities);
    const baseStrategy = {
      stage,
      capabilities,
      desiredRoles,
      scoutTargetRooms: [],
      reserveTargetRooms: [],
      claimTargetRooms: [],
      bootstrapTargetRooms: [],
      attackTargetRooms: []
    };
    const resolved = deriveTargetRooms(room, baseStrategy);
    if (!Memory.strategy) {
      Memory.strategy = {};
    }
    Memory.strategy[room.name] = resolved;
  }
}

// src/colony/layoutPlanner.ts
function isWalkable(room, x, y) {
  if (x < 1 || x > 48 || y < 1 || y > 48) return false;
  return room.getTerrain().get(x, y) !== TERRAIN_MASK_WALL;
}
function edgePenalty(x, y) {
  const distanceToEdge = Math.min(x, 49 - x, y, 49 - y);
  if (distanceToEdge >= COLONY_SETTINGS.layout.minEdgeDistance) return 0;
  return (COLONY_SETTINGS.layout.minEdgeDistance - distanceToEdge) * 20;
}
function walkableAreaScore(room, x, y) {
  let walkable = 0;
  for (let dx = -4; dx <= 4; dx += 1) {
    for (let dy = -4; dy <= 4; dy += 1) {
      if (isWalkable(room, x + dx, y + dy)) {
        walkable += 1;
      }
    }
  }
  return walkable * 2;
}
function distanceScore(distance, desired) {
  return Math.max(0, 50 - Math.abs(distance - desired) * 4);
}
function scoreAnchor(room, x, y) {
  if (!isWalkable(room, x, y)) return Number.NEGATIVE_INFINITY;
  const look = room.lookForAt(LOOK_STRUCTURES, x, y);
  if (look.length > 0) return Number.NEGATIVE_INFINITY;
  let score = walkableAreaScore(room, x, y);
  score -= edgePenalty(x, y);
  const controller = room.controller;
  if (controller) {
    score += distanceScore(controller.pos.getRangeTo(x, y), COLONY_SETTINGS.layout.desiredControllerRange);
  }
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    score += distanceScore(source.pos.getRangeTo(x, y), COLONY_SETTINGS.layout.desiredSourceRange);
  }
  return score;
}
function bestAnchorCandidate(room) {
  let best = null;
  for (let x = COLONY_SETTINGS.layout.scanMin; x <= COLONY_SETTINGS.layout.scanMax; x += 1) {
    for (let y = COLONY_SETTINGS.layout.scanMin; y <= COLONY_SETTINGS.layout.scanMax; y += 1) {
      const score = scoreAnchor(room, x, y);
      if (!Number.isFinite(score)) continue;
      if (!best || score > best.score) {
        best = { x, y, score };
      }
    }
  }
  return best;
}
function getRoomAnchor(room) {
  if (!Memory.roomPlans) {
    Memory.roomPlans = {};
  }
  const cached = Memory.roomPlans[room.name];
  if (cached && isWalkable(room, cached.anchorX, cached.anchorY)) {
    return new RoomPosition(cached.anchorX, cached.anchorY, room.name);
  }
  const spawn = room.find(FIND_MY_SPAWNS)[0];
  if (spawn) {
    Memory.roomPlans[room.name] = {
      anchorX: spawn.pos.x,
      anchorY: spawn.pos.y,
      score: 0,
      createdAt: Game.time
    };
    return spawn.pos;
  }
  const candidate = bestAnchorCandidate(room);
  if (!candidate) return null;
  Memory.roomPlans[room.name] = {
    anchorX: candidate.x,
    anchorY: candidate.y,
    score: candidate.score,
    createdAt: Game.time
  };
  return new RoomPosition(candidate.x, candidate.y, room.name);
}

// src/tasks/movement.ts
function moveToTarget(creep, target, range = 1) {
  creep.moveTo(target, {
    reusePath: 10,
    maxRooms: COLONY_SETTINGS.movement.maxRoomsPerPath,
    range: range != null ? range : COLONY_SETTINGS.movement.defaultRange,
    visualizePathStyle: { stroke: "#8ecae6" }
  });
}
function moveToRoomCenter(creep, roomName) {
  const target = new RoomPosition(25, 25, roomName);
  moveToTarget(creep, target, 20);
}

// src/tasks/minerals.ts
function nonEnergyResourcesInStore(store) {
  const keys = Object.keys(store);
  return keys.filter((resource) => resource !== RESOURCE_ENERGY && store.getUsedCapacity(resource) > 0);
}
function roomMineral(room) {
  var _a;
  return (_a = room.find(FIND_MINERALS)[0]) != null ? _a : null;
}
function roomMineralExtractor(room) {
  const mineral = roomMineral(room);
  if (!mineral) return null;
  const structure = mineral.pos.lookFor(LOOK_STRUCTURES).find((entry) => entry.structureType === STRUCTURE_EXTRACTOR);
  return structure != null ? structure : null;
}
function roomMineralContainer(room) {
  var _a;
  const mineral = roomMineral(room);
  if (!mineral) return null;
  const containers = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
  });
  return (_a = containers[0]) != null ? _a : null;
}
function harvestMineral(creep) {
  const mineral = roomMineral(creep.room);
  if (!mineral || mineral.mineralAmount <= 0) return false;
  const extractor = roomMineralExtractor(creep.room);
  if (!extractor || extractor.cooldown > 0) return false;
  const result = creep.harvest(mineral);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, mineral);
    return true;
  }
  return result === OK;
}
function withdrawMineralsFromContainer(creep) {
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      if (structure.structureType !== STRUCTURE_CONTAINER) return false;
      const store = structure.store;
      const nonEnergyAmount = store.getUsedCapacity() - store.getUsedCapacity(RESOURCE_ENERGY);
      return nonEnergyAmount >= COLONY_SETTINGS.minerals.containerWithdrawMin;
    }
  });
  if (!container) return false;
  const resources = nonEnergyResourcesInStore(container.store);
  const resource = resources[0];
  if (!resource) return false;
  const result = creep.withdraw(container, resource);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, container);
    return true;
  }
  return result === OK;
}
function pickupDroppedMinerals(creep) {
  const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (resource) => resource.resourceType !== RESOURCE_ENERGY && resource.amount > 0
  });
  if (!dropped) return false;
  const result = creep.pickup(dropped);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, dropped);
    return true;
  }
  return result === OK;
}
function transferCarriedMinerals(creep) {
  var _a, _b;
  const target = (_b = (_a = creep.room.storage) != null ? _a : COLONY_SETTINGS.minerals.allowTerminalFallback ? creep.room.terminal : null) != null ? _b : COLONY_SETTINGS.minerals.allowContainerFallback ? creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
  }) : null;
  if (!target) return false;
  const resources = nonEnergyResourcesInStore(creep.store);
  const resource = resources[0];
  if (!resource) return false;
  const result = creep.transfer(target, resource);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
    return true;
  }
  return result === OK;
}

// src/managers/constructionManager.ts
var CORE_RESERVED_OFFSETS = /* @__PURE__ */ new Set([
  // Tower anchors (already managed by placeTowers).
  "3,0",
  "-3,0",
  "0,3",
  "0,-3",
  // Endgame core anchors.
  "1,1",
  "1,-1",
  "-1,1",
  "-1,-1",
  "0,2",
  "2,0",
  // Future lab corridor (kept clear intentionally).
  "4,-1",
  "4,0",
  "4,1",
  "5,-1",
  "5,0",
  "5,1",
  "6,-1",
  "6,0",
  "6,1",
  "5,2"
]);
var CORE_EXTENSION_OFFSETS = [
  [2, 0],
  [-2, 0],
  [0, 2],
  [0, -2],
  [2, 2],
  [2, -2],
  [-2, 2],
  [-2, -2],
  [1, 3],
  [-1, 3],
  [1, -3],
  [-1, -3],
  [3, 1],
  [3, -1],
  [-3, 1],
  [-3, -1],
  [2, 3],
  [-2, 3],
  [2, -3],
  [-2, -3],
  [3, 2],
  [3, -2],
  [-3, 2],
  [-3, -2],
  [1, 4],
  [-1, 4],
  [1, -4],
  [-1, -4],
  [4, 2],
  [4, -2],
  [-4, 2],
  [-4, -2]
];
function placeIfFree(room, x, y, structureType) {
  if (x < 1 || x > 48 || y < 1 || y > 48) return;
  if (room.getTerrain().get(x, y) === TERRAIN_MASK_WALL) return;
  const look = room.lookForAt(LOOK_STRUCTURES, x, y);
  if (look.length > 0) return;
  const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
  if (sites.length > 0) return;
  room.createConstructionSite(x, y, structureType);
}
function extensionBuiltAndSiteCount(room) {
  var _a, _b, _c;
  const max = (_c = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][(_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0]) != null ? _c : 0;
  if (max === 0) return 0;
  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => site.structureType === STRUCTURE_EXTENSION
  }).length;
  return built + sites;
}
function maxExtensions(room) {
  var _a, _b, _c;
  return (_c = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][(_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0]) != null ? _c : 0;
}
function structureBuiltAndSiteCount(room, structureType) {
  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => structure.structureType === structureType
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => site.structureType === structureType
  }).length;
  return built + sites;
}
function structureRemainingCapacity(room, structureType) {
  var _a, _b, _c;
  const max = (_c = CONTROLLER_STRUCTURES[structureType][(_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0]) != null ? _c : 0;
  if (max <= 0) return 0;
  const used = structureBuiltAndSiteCount(room, structureType);
  return Math.max(0, max - used);
}
function placeCoreExtensions(room, anchor) {
  const max = maxExtensions(room);
  if (max === 0) return;
  let used = extensionBuiltAndSiteCount(room);
  if (used >= max) return;
  for (const [dx, dy] of CORE_EXTENSION_OFFSETS) {
    if (used >= max) break;
    if (CORE_RESERVED_OFFSETS.has(`${dx},${dy}`)) continue;
    placeIfFree(room, anchor.x + dx, anchor.y + dy, STRUCTURE_EXTENSION);
    used = extensionBuiltAndSiteCount(room);
  }
}
function isSourceExtensionPosition(room, structure) {
  if (structure.structureType !== STRUCTURE_EXTENSION) return false;
  const sources = room.find(FIND_SOURCES);
  return sources.some((source) => structure.pos.getRangeTo(source) <= 2);
}
function sourceExtensionAvgFill(room) {
  const sourceExtensions2 = room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => isSourceExtensionPosition(room, structure)
  });
  if (sourceExtensions2.length === 0) return 0;
  const ratios = sourceExtensions2.map((extension) => {
    const used = extension.store.getUsedCapacity(RESOURCE_ENERGY);
    const total = extension.store.getCapacity(RESOURCE_ENERGY);
    if (!total) return 0;
    return used / total;
  });
  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
}
function shouldPlaceSourceExtensions(room) {
  var _a, _b;
  const rcl = (_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0;
  if (rcl < COLONY_SETTINGS.construction.sourceExtensionsMinRcl) return false;
  if (COLONY_SETTINGS.construction.requireEnergyCapForSourceExtensions) {
    if (room.energyAvailable < room.energyCapacityAvailable) return false;
  }
  return sourceExtensionAvgFill(room) <= COLONY_SETTINGS.construction.sourceExtensionMaxAvgFillRatioToExpand;
}
function extensionCandidatesNearSource(room, anchor, source) {
  const terrain = room.getTerrain();
  const positions = [];
  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dy = -2; dy <= 2; dy += 1) {
      const x = source.pos.x + dx;
      const y = source.pos.y + dy;
      if (x < 1 || x > 48 || y < 1 || y > 48) continue;
      const rangeToSource = Math.max(Math.abs(dx), Math.abs(dy));
      if (rangeToSource < 1 || rangeToSource > 2) continue;
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;
      if (room.controller && room.controller.pos.getRangeTo(x, y) <= 2) continue;
      positions.push([x, y]);
    }
  }
  positions.sort((a, b) => anchor.getRangeTo(a[0], a[1]) - anchor.getRangeTo(b[0], b[1]));
  return positions;
}
function placeSourceExtensions(room, anchor) {
  const max = maxExtensions(room);
  if (max === 0) return;
  if (!shouldPlaceSourceExtensions(room)) return;
  const perSource = Math.max(0, COLONY_SETTINGS.construction.sourceExtensionsPerSource);
  if (perSource === 0) return;
  let used = extensionBuiltAndSiteCount(room);
  if (used >= max) return;
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    if (used >= max) break;
    const candidates = extensionCandidatesNearSource(room, anchor, source);
    for (const [x, y] of candidates) {
      if (used >= max) break;
      const existing = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
      }).length;
      const pending = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION
      }).length;
      if (existing + pending >= perSource) break;
      placeIfFree(room, x, y, STRUCTURE_EXTENSION);
      used = extensionBuiltAndSiteCount(room);
    }
  }
}
function placeRoadsFromAnchor(room, anchor) {
  const controller = room.controller;
  if (controller) {
    const path = anchor.findPathTo(controller.pos, { ignoreCreeps: true });
    for (const step of path) {
      placeIfFree(room, step.x, step.y, STRUCTURE_ROAD);
    }
  }
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    const path = anchor.findPathTo(source.pos, { ignoreCreeps: true });
    for (const step of path) {
      placeIfFree(room, step.x, step.y, STRUCTURE_ROAD);
    }
  }
}
function placeSourceContainers(room, anchor) {
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    const hasContainer = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
    }).length;
    if (hasContainer > 0) continue;
    const path = anchor.findPathTo(source.pos, { ignoreCreeps: true });
    const finalStep = path[path.length - 1];
    if (!finalStep) continue;
    placeIfFree(room, finalStep.x, finalStep.y, STRUCTURE_CONTAINER);
  }
}
function placeTowers(room, anchor) {
  var _a, _b, _c;
  const max = (_c = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][(_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0]) != null ? _c : 0;
  if (max === 0) return;
  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => structure.structureType === STRUCTURE_TOWER
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => site.structureType === STRUCTURE_TOWER
  }).length;
  if (built + sites >= max) return;
  placeIfFree(room, anchor.x + 3, anchor.y, STRUCTURE_TOWER);
  placeIfFree(room, anchor.x - 3, anchor.y, STRUCTURE_TOWER);
  placeIfFree(room, anchor.x, anchor.y + 3, STRUCTURE_TOWER);
}
function placeCoreLogistics(room, anchor) {
  if (structureRemainingCapacity(room, STRUCTURE_STORAGE) > 0) {
    placeIfFree(room, anchor.x + 1, anchor.y + 1, STRUCTURE_STORAGE);
  }
  if (structureRemainingCapacity(room, STRUCTURE_TERMINAL) > 0) {
    placeIfFree(room, anchor.x + 1, anchor.y - 1, STRUCTURE_TERMINAL);
  }
  if (structureRemainingCapacity(room, STRUCTURE_FACTORY) > 0) {
    placeIfFree(room, anchor.x - 1, anchor.y + 1, STRUCTURE_FACTORY);
  }
  if (structureRemainingCapacity(room, STRUCTURE_LINK) > 0) {
    placeIfFree(room, anchor.x - 1, anchor.y - 1, STRUCTURE_LINK);
  }
}
function placeLabCluster(room, anchor) {
  let remaining = structureRemainingCapacity(room, STRUCTURE_LAB);
  if (remaining <= 0) return;
  const offsets = [
    [4, -1],
    [4, 0],
    [4, 1],
    [5, -1],
    [5, 0],
    [5, 1],
    [6, -1],
    [6, 0],
    [6, 1],
    [5, 2]
  ];
  for (const [dx, dy] of offsets) {
    if (remaining <= 0) break;
    const before = structureBuiltAndSiteCount(room, STRUCTURE_LAB);
    placeIfFree(room, anchor.x + dx, anchor.y + dy, STRUCTURE_LAB);
    const after = structureBuiltAndSiteCount(room, STRUCTURE_LAB);
    if (after > before) {
      remaining -= 1;
    }
  }
}
function placeSourceAndControllerLinks(room, anchor) {
  let remaining = structureRemainingCapacity(room, STRUCTURE_LINK);
  if (remaining <= 0) return;
  if (room.controller) {
    const existingNearController = room.controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {
      filter: (structure) => structure.structureType === STRUCTURE_LINK
    }).length;
    const sitesNearController = room.controller.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
      filter: (site) => site.structureType === STRUCTURE_LINK
    }).length;
    if (existingNearController + sitesNearController === 0) {
      const path = anchor.findPathTo(room.controller.pos, { ignoreCreeps: true });
      const finalStep = path[path.length - 1];
      if (finalStep) {
        const before = structureBuiltAndSiteCount(room, STRUCTURE_LINK);
        placeIfFree(room, finalStep.x, finalStep.y, STRUCTURE_LINK);
        const after = structureBuiltAndSiteCount(room, STRUCTURE_LINK);
        if (after > before) {
          remaining -= 1;
        }
      }
    }
  }
  if (remaining <= 0) return;
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    if (remaining <= 0) break;
    const existing = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
      filter: (structure) => structure.structureType === STRUCTURE_LINK
    }).length;
    const sites = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
      filter: (site) => site.structureType === STRUCTURE_LINK
    }).length;
    if (existing + sites > 0) continue;
    const path = anchor.findPathTo(source.pos, { ignoreCreeps: true });
    const finalStep = path[path.length - 1];
    if (!finalStep) continue;
    const before = structureBuiltAndSiteCount(room, STRUCTURE_LINK);
    placeIfFree(room, finalStep.x, finalStep.y, STRUCTURE_LINK);
    const after = structureBuiltAndSiteCount(room, STRUCTURE_LINK);
    if (after > before) {
      remaining -= 1;
    }
  }
}
function placeMineralInfrastructure(room, anchor) {
  var _a, _b, _c, _d;
  if (!COLONY_SETTINGS.minerals.enabled) return;
  if (((_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0) < COLONY_SETTINGS.minerals.minRcl) return;
  const mineral = roomMineral(room);
  if (!mineral) return;
  const extractorExists = mineral.pos.lookFor(LOOK_STRUCTURES).some((structure) => structure.structureType === STRUCTURE_EXTRACTOR);
  const extractorSiteExists = mineral.pos.lookFor(LOOK_CONSTRUCTION_SITES).some((site) => site.structureType === STRUCTURE_EXTRACTOR);
  if (!extractorExists && !extractorSiteExists) {
    room.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
  }
  const hasContainer = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
  }).length;
  const hasContainerSite = mineral.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
    filter: (site) => site.structureType === STRUCTURE_CONTAINER
  }).length;
  if (hasContainer + hasContainerSite === 0) {
    const path = anchor.findPathTo(mineral.pos, { ignoreCreeps: true });
    const finalStep = path[path.length - 1];
    if (finalStep) {
      placeIfFree(room, finalStep.x, finalStep.y, STRUCTURE_CONTAINER);
    }
  }
  if ((_d = (_c = Memory.strategy) == null ? void 0 : _c[room.name]) == null ? void 0 : _d.capabilities.allowRoads) {
    const path = anchor.findPathTo(mineral.pos, { ignoreCreeps: true });
    for (const step of path) {
      placeIfFree(room, step.x, step.y, STRUCTURE_ROAD);
    }
  }
}
function placeDefensiveRing(room, anchor) {
  for (let dx = -4; dx <= 4; dx += 1) {
    for (let dy = -4; dy <= 4; dy += 1) {
      const onEdge = Math.abs(dx) === 4 || Math.abs(dy) === 4;
      if (!onEdge) continue;
      placeIfFree(room, anchor.x + dx, anchor.y + dy, STRUCTURE_WALL);
    }
  }
}
function runConstructionManager() {
  var _a, _b;
  if (Game.time % COLONY_SETTINGS.construction.runInterval !== 0) return;
  for (const room of Object.values(Game.rooms)) {
    if (!((_a = room.controller) == null ? void 0 : _a.my)) continue;
    const strategy = (_b = Memory.strategy) == null ? void 0 : _b[room.name];
    if (!strategy) continue;
    const anchor = getRoomAnchor(room);
    if (!anchor) continue;
    const siteCount = room.find(FIND_CONSTRUCTION_SITES).length;
    if (siteCount > COLONY_SETTINGS.construction.maxRoomConstructionSites) continue;
    if (COLONY_SETTINGS.construction.autoPlaceSpawnInClaimedRooms) {
      const hasSpawn = room.find(FIND_MY_SPAWNS).length > 0;
      const hasSpawnSite = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_SPAWN
      }).length;
      if (!hasSpawn && hasSpawnSite === 0) {
        room.createConstructionSite(anchor.x, anchor.y, STRUCTURE_SPAWN);
      }
    }
    placeSourceExtensions(room, anchor);
    placeCoreExtensions(room, anchor);
    placeSourceContainers(room, anchor);
    placeCoreLogistics(room, anchor);
    placeLabCluster(room, anchor);
    placeSourceAndControllerLinks(room, anchor);
    placeMineralInfrastructure(room, anchor);
    if (strategy.capabilities.allowRoads) {
      placeRoadsFromAnchor(room, anchor);
    }
    if (strategy.capabilities.allowTowers) {
      placeTowers(room, anchor);
    }
    if (strategy.capabilities.allowWalls) {
      placeDefensiveRing(room, anchor);
    }
  }
}

// src/managers/defenseManager.ts
function pickPriorityHostile(tower) {
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
function threatLevel(roomName) {
  var _a;
  const threat = (_a = Memory.threat) == null ? void 0 : _a[roomName];
  if (!threat || threat.expiresAt < Game.time) return "none";
  return threat.level;
}
function runDefenseManager() {
  const towers = _.filter(
    Object.values(Game.structures),
    (structure) => structure.structureType === STRUCTURE_TOWER && structure.my
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
      filter: (creep) => creep.hits < creep.hitsMax
    });
    if (wounded) {
      tower.heal(wounded);
      continue;
    }
    if (inCombat) continue;
    const repairTarget = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => {
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

// src/managers/linkManager.ts
function myLinks(room) {
  return room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => structure.structureType === STRUCTURE_LINK
  });
}
function controllerLinks(room, links) {
  const controller = room.controller;
  if (!controller) return [];
  return links.filter((link) => link.pos.getRangeTo(controller) <= 2);
}
function sourceLinks(room, links) {
  const sources = room.find(FIND_SOURCES);
  return links.filter((link) => sources.some((source) => link.pos.getRangeTo(source) <= 2));
}
function coreLinks(room, links, controller, source) {
  const excluded = /* @__PURE__ */ new Set([...controller.map((link) => link.id), ...source.map((link) => link.id)]);
  const roomAnchor = getRoomAnchor(room);
  const remaining = links.filter((link) => !excluded.has(link.id));
  if (!roomAnchor) return remaining;
  return remaining.sort((a, b) => a.pos.getRangeTo(roomAnchor) - b.pos.getRangeTo(roomAnchor));
}
function canSend(link) {
  if (link.cooldown > 0) return false;
  return link.store.getUsedCapacity(RESOURCE_ENERGY) >= COLONY_SETTINGS.links.senderMinEnergy;
}
function pickReceiver(receivers) {
  const viable = receivers.filter(
    (link) => link.store.getFreeCapacity(RESOURCE_ENERGY) >= COLONY_SETTINGS.links.receiverMinFreeCapacity
  );
  if (viable.length === 0) return null;
  viable.sort(
    (a, b) => b.store.getFreeCapacity(RESOURCE_ENERGY) - a.store.getFreeCapacity(RESOURCE_ENERGY)
  );
  return viable[0];
}
function runRoomLinks(room) {
  var _a, _b, _c;
  const rcl = (_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0;
  if (rcl < COLONY_SETTINGS.links.minRcl) return;
  const links = myLinks(room);
  if (links.length < 2) return;
  const controller = controllerLinks(room, links);
  const source = sourceLinks(room, links);
  const core = coreLinks(room, links, controller, source);
  const controllerNeedsEnergy = controller.filter(
    (link) => link.store.getUsedCapacity(RESOURCE_ENERGY) < COLONY_SETTINGS.links.controllerLinkTargetLevel
  );
  for (const sender of source) {
    if (!canSend(sender)) continue;
    const preferred = (_c = pickReceiver(controllerNeedsEnergy)) != null ? _c : pickReceiver(core);
    if (!preferred) continue;
    sender.transferEnergy(preferred);
  }
  for (const sender of core) {
    if (!canSend(sender)) continue;
    const receiver = pickReceiver(controllerNeedsEnergy);
    if (!receiver) continue;
    sender.transferEnergy(receiver);
  }
}
function runLinkManager() {
  var _a;
  if (!COLONY_SETTINGS.links.enabled) return;
  for (const room of Object.values(Game.rooms)) {
    if (!((_a = room.controller) == null ? void 0 : _a.my)) continue;
    runRoomLinks(room);
  }
}

// src/config/bodyPlans.ts
var ROLE_BODIES = {
  harvester: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 6 },
  hauler: { min: [CARRY, CARRY, MOVE], segment: [CARRY, CARRY, MOVE], maxSegments: 8 },
  miner: { min: [WORK, WORK, CARRY, MOVE], segment: [WORK, WORK, MOVE], maxSegments: 4 },
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

// src/utils.ts
var PART_COST = {
  move: 50,
  work: 100,
  carry: 50,
  attack: 80,
  ranged_attack: 150,
  tough: 10,
  heal: 250,
  claim: 600
};
function bodyCost(body) {
  return body.reduce((sum, part) => sum + PART_COST[part], 0);
}
function cleanupMemory() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

// src/managers/spawnManager.ts
function buildBody(role, energyBudget) {
  const blueprint = ROLE_BODIES[role];
  const minCost = bodyCost(blueprint.min);
  if (energyBudget < minCost) return null;
  const body = [...blueprint.min];
  const segmentCost = bodyCost(blueprint.segment);
  let segments = 1;
  while (segments < blueprint.maxSegments && body.length + blueprint.segment.length <= 50 && bodyCost(body) + segmentCost <= energyBudget) {
    body.push(...blueprint.segment);
    segments += 1;
  }
  return body;
}
function nextRoleToSpawn(spawn) {
  var _a, _b;
  const strategy = (_a = Memory.strategy) == null ? void 0 : _a[spawn.room.name];
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
    const desired = (_b = strategy.desiredRoles[role]) != null ? _b : 0;
    if (desired <= 0) continue;
    const currentCount = current.filter((creep) => creep.memory.role === role).length;
    if (currentCount < desired) {
      return role;
    }
  }
  return null;
}
function shouldBypassEnergyGate(spawn, role) {
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
function minimumEnergyForRole(spawn, role) {
  if (role !== "miner") return 0;
  return Math.min(spawn.room.energyCapacityAvailable, 550);
}
function pickBootstrapTargetRoom(homeRoom, targets) {
  if (targets.length === 0) return void 0;
  let bestTarget;
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
function reinforcementNeedForRoom(roomName) {
  var _a;
  const threat = (_a = Memory.threat) == null ? void 0 : _a[roomName];
  if (!threat || threat.expiresAt < Game.time) return 0;
  return getEmergencySoldierCount(roomName);
}
function currentDefendersAssigned(roomName) {
  return Object.values(Game.creeps).filter((creep) => {
    if (creep.memory.role !== "soldier") return false;
    if (creep.memory.homeRoom === roomName) return true;
    return creep.memory.targetRoom === roomName;
  }).length;
}
function pickReinforcementTarget(homeRoom) {
  const candidateRooms = Object.values(Game.rooms).filter((room) => {
    var _a;
    return ((_a = room.controller) == null ? void 0 : _a.my) && room.name !== homeRoom;
  });
  let bestTarget;
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
function runSpawnManager() {
  var _a;
  const spawns = Object.values(Game.spawns);
  for (const spawn of spawns) {
    if (spawn.spawning) continue;
    const role = nextRoleToSpawn(spawn);
    if (!role) continue;
    const strategy = (_a = Memory.strategy) == null ? void 0 : _a[spawn.room.name];
    if (!strategy) continue;
    const bootstrapTargetRoom = role === "bootstrapper" ? pickBootstrapTargetRoom(spawn.room.name, strategy.bootstrapTargetRooms) : void 0;
    if (role === "bootstrapper" && !bootstrapTargetRoom) continue;
    const localEmergency = getEmergencySoldierCount(spawn.room.name);
    const reinforcementTargetRoom = role === "soldier" && localEmergency === 0 ? pickReinforcementTarget(spawn.room.name) : void 0;
    const targetRoom = bootstrapTargetRoom != null ? bootstrapTargetRoom : reinforcementTargetRoom;
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

// src/managers/telemetryManager.ts
function summarizeThreat(roomName) {
  var _a;
  const threat = (_a = Memory.threat) == null ? void 0 : _a[roomName];
  if (!threat || threat.expiresAt < Game.time) return "none";
  return `${threat.level}:${threat.score}`;
}
function runTelemetryManager() {
  var _a, _b, _c, _d, _e;
  if (!COLONY_SETTINGS.telemetry.enabled) return;
  if (Game.time % COLONY_SETTINGS.telemetry.interval !== 0) return;
  const ownedRooms = Object.values(Game.rooms).filter((room) => {
    var _a2;
    return (_a2 = room.controller) == null ? void 0 : _a2.my;
  });
  for (const room of ownedRooms) {
    const state = (_b = (_a = Memory.roomState) == null ? void 0 : _a[room.name]) != null ? _b : "unknown";
    const threat = summarizeThreat(room.name);
    const strategy = (_c = Memory.strategy) == null ? void 0 : _c[room.name];
    const claim = (_d = strategy == null ? void 0 : strategy.claimTargetRooms[0]) != null ? _d : "-";
    const bootstrap = (_e = strategy == null ? void 0 : strategy.bootstrapTargetRooms.join(",")) != null ? _e : "-";
    const soldiers = Object.values(Game.creeps).filter(
      (creep) => creep.memory.homeRoom === room.name && creep.memory.role === "soldier"
    ).length;
    console.log(
      `[telemetry][${room.name}] state=${state} threat=${threat} soldiers=${soldiers} claim=${claim} bootstrap=${bootstrap}`
    );
  }
}

// src/tasks/work.ts
function upgradeController(creep) {
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
function buildNearestSite(creep) {
  const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
  if (!site) return false;
  const result = creep.build(site);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, site);
    return true;
  }
  return result === OK;
}
function repairInfrastructure(creep) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
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
function fortifyDefenses(creep, minWallHits) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
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

// src/tasks/energy.ts
function isSourceWorker(creep) {
  return creep.memory.role === "harvester" || creep.memory.role === "miner";
}
function sourceLoad(roomName, sourceId, excludeCreepName) {
  let load = 0;
  for (const other of Object.values(Game.creeps)) {
    if (other.name === excludeCreepName) continue;
    if (other.memory.homeRoom !== roomName) continue;
    if (!isSourceWorker(other)) continue;
    if (other.memory.sourceId === sourceId) {
      load += 1;
    }
  }
  return load;
}
function assignSource(creep) {
  var _a;
  const sources = creep.room.find(FIND_SOURCES_ACTIVE);
  if (sources.length === 0) return null;
  if (!isSourceWorker(creep)) {
    if (creep.memory.sourceId) {
      const existing2 = Game.getObjectById(creep.memory.sourceId);
      if (existing2) return existing2;
    }
    const nearest = (_a = creep.pos.findClosestByPath(sources)) != null ? _a : sources[0];
    creep.memory.sourceId = nearest.id;
    return nearest;
  }
  const existing = creep.memory.sourceId !== void 0 ? Game.getObjectById(creep.memory.sourceId) : null;
  const shouldRebalance = Game.time % 25 === 0;
  if (existing && !shouldRebalance) {
    return existing;
  }
  let best = null;
  let bestLoad = Number.MAX_SAFE_INTEGER;
  let bestRange = Number.MAX_SAFE_INTEGER;
  for (const source of sources) {
    const load = sourceLoad(creep.memory.homeRoom, source.id, creep.name);
    const range = creep.pos.getRangeTo(source);
    if (load < bestLoad || load === bestLoad && range < bestRange) {
      best = source;
      bestLoad = load;
      bestRange = range;
    }
  }
  const selected = best != null ? best : sources[0];
  creep.memory.sourceId = selected.id;
  return selected;
}
function harvestEnergy(creep) {
  const source = assignSource(creep);
  if (!source) return false;
  const result = creep.harvest(source);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, source);
    return true;
  }
  return result === OK;
}
function withdrawStoredEnergy(creep) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      if (structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_CONTAINER) {
        return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
      }
      return false;
    }
  });
  if (!target) return false;
  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
    return true;
  }
  return result === OK;
}
function pickupDroppedEnergy(creep) {
  const resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (dropped) => dropped.resourceType === RESOURCE_ENERGY && dropped.amount > COLONY_SETTINGS.energy.pickupDroppedEnergyMinAmount
  });
  if (!resource) return false;
  const result = creep.pickup(resource);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, resource);
    return true;
  }
  return result === OK;
}
function fillPriorityEnergyTargets(creep) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      if (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_TOWER) {
        return structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
      return false;
    }
  });
  if (!target) return false;
  const result = creep.transfer(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, target);
    return true;
  }
  return result === OK;
}

// src/roles/common.ts
function updateWorkingState(creep) {
  if (creep.memory.working && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.working = false;
  }
  if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }
}
function acquireEnergy(creep) {
  return withdrawStoredEnergy(creep) || pickupDroppedEnergy(creep) || harvestEnergy(creep);
}

// src/roles/builder.ts
function runBuilder(creep) {
  updateWorkingState(creep);
  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }
  if (buildNearestSite(creep)) return;
  upgradeController(creep);
}

// src/roles/bootstrapper.ts
function buildSpawnFirst(creep) {
  const spawnSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => site.structureType === STRUCTURE_SPAWN
  });
  if (!spawnSite) return false;
  const result = creep.build(spawnSite);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawnSite, { reusePath: 10, visualizePathStyle: { stroke: "#e76f51" } });
    return true;
  }
  return result === OK;
}
function runBootstrapper(creep) {
  const targetRoom = creep.memory.targetRoom;
  if (!targetRoom) return;
  if (creep.room.name !== targetRoom) {
    moveToRoomCenter(creep, targetRoom);
    return;
  }
  updateWorkingState(creep);
  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }
  if (buildSpawnFirst(creep)) return;
  if (buildNearestSite(creep)) return;
  if (fillPriorityEnergyTargets(creep)) return;
  upgradeController(creep);
}

// src/tasks/combat.ts
function reserveRoomController(creep, roomName) {
  if (creep.room.name !== roomName) {
    moveToRoomCenter(creep, roomName);
    return true;
  }
  const controller = creep.room.controller;
  if (!controller) return false;
  const result = creep.reserveController(controller);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, controller);
    return true;
  }
  return result === OK;
}
function claimRoomController(creep, roomName) {
  if (creep.room.name !== roomName) {
    moveToRoomCenter(creep, roomName);
    return true;
  }
  const controller = creep.room.controller;
  if (!controller) return false;
  const result = creep.claimController(controller);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, controller);
    return true;
  }
  return result === OK;
}
function attackInRoom(creep, roomName) {
  var _a;
  const targetRoom = Game.rooms[roomName];
  const defendingOwnedRoom = Boolean((_a = targetRoom == null ? void 0 : targetRoom.controller) == null ? void 0 : _a.my);
  if (defendingOwnedRoom) {
    if (!COLONY_SETTINGS.combat.defenseEnabled) return false;
    if (!COLONY_SETTINGS.combat.defendEvenIfOffenseDisabled && !isAttackAllowed(creep.memory.homeRoom, roomName)) {
      return false;
    }
  } else if (!isAttackAllowed(creep.memory.homeRoom, roomName)) {
    return false;
  }
  if (creep.room.name !== roomName) {
    moveToRoomCenter(creep, roomName);
    return true;
  }
  const hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
  if (hostile) {
    const result2 = creep.attack(hostile);
    if (result2 === ERR_NOT_IN_RANGE) {
      moveToTarget(creep, hostile);
      return true;
    }
    return result2 === OK;
  }
  const hostileStructure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
    filter: (structure) => structure.structureType !== STRUCTURE_CONTROLLER
  });
  if (!hostileStructure) return false;
  const result = creep.attack(hostileStructure);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, hostileStructure);
    return true;
  }
  return result === OK;
}

// src/roles/claimer.ts
function runClaimer(creep) {
  var _a, _b, _c, _d;
  const targets = (_c = (_b = (_a = Memory.strategy) == null ? void 0 : _a[creep.memory.homeRoom]) == null ? void 0 : _b.claimTargetRooms) != null ? _c : [];
  if (targets.length === 0) return;
  const targetRoom = targets[0];
  if (claimRoomController(creep, targetRoom)) {
    if (creep.room.name === targetRoom && ((_d = creep.room.controller) == null ? void 0 : _d.my)) {
      markManualTargetClaimed(creep.memory.homeRoom, targetRoom);
    }
  }
}

// src/roles/harvester.ts
function runHarvester(creep) {
  updateWorkingState(creep);
  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }
  if (fillPriorityEnergyTargets(creep)) return;
  upgradeController(creep);
}

// src/roles/hauler.ts
function isNearAnySource(room, pos, range = 2) {
  const sources = room.find(FIND_SOURCES);
  return sources.some((source) => pos.getRangeTo(source) <= range);
}
function withdrawFromSourceExtensions(creep) {
  const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (structure) => {
      if (structure.structureType !== STRUCTURE_EXTENSION) return false;
      if (!isNearAnySource(creep.room, structure.pos, 2)) return false;
      const extension = structure;
      return extension.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }
  });
  if (!target) return false;
  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { reusePath: 15, visualizePathStyle: { stroke: "#219ebc" } });
    return true;
  }
  return result === OK;
}
function withdrawFromSourceContainers(creep) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      if (structure.structureType !== STRUCTURE_CONTAINER) return false;
      if (!isNearAnySource(creep.room, structure.pos, 1)) return false;
      const container = structure;
      return container.store.getUsedCapacity(RESOURCE_ENERGY) >= COLONY_SETTINGS.energy.haulerContainerWithdrawMinEnergy;
    }
  });
  if (!target) return false;
  const result = creep.withdraw(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { reusePath: 15, visualizePathStyle: { stroke: "#219ebc" } });
    return true;
  }
  return result === OK;
}
function fillCoreEnergyTargets(creep) {
  var _a;
  const homeRoom = Game.rooms[creep.memory.homeRoom];
  const anchor = (_a = homeRoom == null ? void 0 : homeRoom.find(FIND_MY_SPAWNS)[0]) == null ? void 0 : _a.pos;
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      if (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_TOWER) {
        return structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
      if (structure.structureType !== STRUCTURE_EXTENSION) return false;
      if (anchor && structure.pos.getRangeTo(anchor) > COLONY_SETTINGS.logistics.coreDeliveryRangeFromSpawn) return false;
      return structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }
  });
  if (!target) return false;
  const result = creep.transfer(target, RESOURCE_ENERGY);
  if (result === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { reusePath: 10, visualizePathStyle: { stroke: "#219ebc" } });
    return true;
  }
  return result === OK;
}
function runHauler(creep) {
  updateWorkingState(creep);
  if (!creep.memory.working) {
    if (withdrawFromSourceExtensions(creep)) return;
    if (withdrawFromSourceContainers(creep)) return;
    if (withdrawStoredEnergy(creep)) return;
    pickupDroppedEnergy(creep);
    return;
  }
  if (fillCoreEnergyTargets(creep)) return;
  fillPriorityEnergyTargets(creep);
}

// src/roles/miner.ts
function sourceExtensions(creep) {
  const source = creep.memory.sourceId ? Game.getObjectById(creep.memory.sourceId) : null;
  if (!source) return [];
  return source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
    filter: (structure) => structure.structureType === STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  });
}
function sourceContainer(creep) {
  var _a;
  const source = creep.memory.sourceId ? Game.getObjectById(creep.memory.sourceId) : null;
  if (!source) return null;
  const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
  });
  return (_a = containers[0]) != null ? _a : null;
}
function runMiner(creep) {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    const extension = creep.pos.findClosestByRange(sourceExtensions(creep));
    if (extension) {
      const result = creep.transfer(extension, RESOURCE_ENERGY);
      if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(extension, { reusePath: 10, visualizePathStyle: { stroke: "#ffb703" } });
      }
      return;
    }
  }
  const container = sourceContainer(creep);
  if (container && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    const transfer = creep.transfer(container, RESOURCE_ENERGY);
    if (transfer === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, { reusePath: 10, visualizePathStyle: { stroke: "#ffb703" } });
    }
    return;
  }
  if (container && creep.pos.getRangeTo(container) > 0) {
    creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: "#ffb703" } });
    return;
  }
  harvestEnergy(creep);
}

// src/roles/mineralHauler.ts
function runMineralHauler(creep) {
  updateWorkingState(creep);
  if (!creep.memory.working) {
    if (withdrawMineralsFromContainer(creep)) return;
    pickupDroppedMinerals(creep);
    return;
  }
  transferCarriedMinerals(creep);
}

// src/roles/mineralMiner.ts
function runMineralMiner(creep) {
  const mineral = roomMineral(creep.room);
  if (!mineral || mineral.mineralAmount <= 0) return;
  const container = roomMineralContainer(creep.room);
  if (container && creep.pos.getRangeTo(container) > 0) {
    creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: "#c77dff" } });
    return;
  }
  if (creep.store.getFreeCapacity() === 0) {
    if (container) {
      const resource = Object.keys(creep.store).find(
        (entry) => entry !== RESOURCE_ENERGY && creep.store.getUsedCapacity(entry) > 0
      );
      if (!resource) return;
      const result = creep.transfer(container, resource);
      if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { reusePath: 10, visualizePathStyle: { stroke: "#c77dff" } });
      }
      return;
    }
    transferCarriedMinerals(creep);
    return;
  }
  harvestMineral(creep);
}

// src/roles/repairer.ts
function runRepairer(creep) {
  updateWorkingState(creep);
  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }
  if (repairInfrastructure(creep)) return;
  upgradeController(creep);
}

// src/roles/reserver.ts
function runReserver(creep) {
  var _a, _b, _c;
  const targets = (_c = (_b = (_a = Memory.strategy) == null ? void 0 : _a[creep.memory.homeRoom]) == null ? void 0 : _b.reserveTargetRooms) != null ? _c : [];
  if (targets.length === 0) return;
  const targetRoom = targets[Game.time % targets.length];
  reserveRoomController(creep, targetRoom);
}

// src/roles/scout.ts
function runScout(creep) {
  var _a, _b, _c;
  const targets = (_c = (_b = (_a = Memory.strategy) == null ? void 0 : _a[creep.memory.homeRoom]) == null ? void 0 : _b.scoutTargetRooms) != null ? _c : [];
  if (targets.length === 0) return;
  const targetRoom = targets[Game.time % targets.length];
  if (creep.room.name !== targetRoom) {
    moveToRoomCenter(creep, targetRoom);
    return;
  }
  creep.moveTo(25, 25, { reusePath: 5 });
}

// src/roles/soldier.ts
function runSoldier(creep) {
  var _a, _b, _c;
  if (creep.memory.targetRoom) {
    if (attackInRoom(creep, creep.memory.targetRoom)) return;
  }
  const targets = (_c = (_b = (_a = Memory.strategy) == null ? void 0 : _a[creep.memory.homeRoom]) == null ? void 0 : _b.attackTargetRooms) != null ? _c : [];
  if (targets.length === 0) return;
  const targetRoom = targets[Game.time % targets.length];
  attackInRoom(creep, targetRoom);
}

// src/roles/upgrader.ts
function runUpgrader(creep) {
  updateWorkingState(creep);
  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }
  upgradeController(creep);
}

// src/roles/waller.ts
function runWaller(creep) {
  var _a, _b;
  updateWorkingState(creep);
  if (!creep.memory.working) {
    acquireEnergy(creep);
    return;
  }
  const rcl = (_b = (_a = creep.room.controller) == null ? void 0 : _a.level) != null ? _b : 1;
  if (fortifyDefenses(creep, getWallTargetHits(rcl))) return;
  upgradeController(creep);
}

// src/roles/index.ts
function runRole(creep) {
  switch (creep.memory.role) {
    case "harvester":
      runHarvester(creep);
      return;
    case "hauler":
      runHauler(creep);
      return;
    case "miner":
      runMiner(creep);
      return;
    case "mineralMiner":
      runMineralMiner(creep);
      return;
    case "mineralHauler":
      runMineralHauler(creep);
      return;
    case "upgrader":
      runUpgrader(creep);
      return;
    case "builder":
      runBuilder(creep);
      return;
    case "bootstrapper":
      runBootstrapper(creep);
      return;
    case "repairer":
      runRepairer(creep);
      return;
    case "waller":
      runWaller(creep);
      return;
    case "scout":
      runScout(creep);
      return;
    case "reserver":
      runReserver(creep);
      return;
    case "claimer":
      runClaimer(creep);
      return;
    case "soldier":
      runSoldier(creep);
      return;
  }
}

// src/main.ts
var loop = () => {
  cleanupMemory();
  runThreatManager();
  runColonyManager();
  runSpawnManager();
  runConstructionManager();
  runLinkManager();
  runDefenseManager();
  runTelemetryManager();
  for (const creep of Object.values(Game.creeps)) {
    runRole(creep);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loop
});
//# sourceMappingURL=main.js.map
