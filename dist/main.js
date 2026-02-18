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
  "upgrader",
  "builder",
  "repairer",
  "waller",
  "scout",
  "reserver",
  "claimer",
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
    baseHaulers: 1,
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
  construction: {
    runInterval: 37,
    maxRoomConstructionSites: 10
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
  movement: {
    maxRoomsPerPath: 16,
    defaultRange: 1
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
  if (!COLONY_SETTINGS.pvp.enabled || roomSettings.disablePvP) return false;
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
function getWallTargetHits(rcl) {
  const target = COLONY_SETTINGS.walls.targetHitsByRcl[rcl];
  if (target) return target;
  return rcl >= 8 ? COLONY_SETTINGS.walls.targetHitsByRcl[8] : COLONY_SETTINGS.walls.targetHitsByRcl[1];
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
function deriveDesiredRoles(snapshot, stage, capabilities) {
  var _a, _b;
  const desired = baseDesired();
  const roomSettings = resolveRoomSettings(snapshot.roomName);
  desired.harvester = Math.max(COLONY_SETTINGS.planner.minHarvesters, snapshot.sourceCount);
  desired.hauler = COLONY_SETTINGS.planner.baseHaulers;
  desired.upgrader = COLONY_SETTINGS.planner.baseUpgraders;
  desired.builder = snapshot.constructionSiteCount > 0 ? COLONY_SETTINGS.planner.buildersWhenSitesExist : COLONY_SETTINGS.planner.buildersWhenNoSites;
  if (stage !== "bootstrap") {
    desired.miner = snapshot.sourceCount;
    desired.hauler = Math.max(desired.hauler, snapshot.sourceCount, COLONY_SETTINGS.planner.baseHaulers);
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
  if (capabilities.allowExpansion) {
    desired.claimer = COLONY_SETTINGS.planner.claimerCount;
  }
  if (capabilities.allowOffense) {
    desired.soldier = Math.max(
      COLONY_SETTINGS.planner.minSoldiers,
      Math.ceil(snapshot.hostileCount / Math.max(1, COLONY_SETTINGS.planner.hostilesPerSoldier))
    );
  }
  applyRoleOverrides(desired, COLONY_SETTINGS.roleTargets.default);
  applyRoleOverrides(desired, (_a = COLONY_SETTINGS.roleTargets.byStage[stage]) != null ? _a : {});
  applyRoleOverrides(desired, roomSettings.roleTargets);
  applyRoleOverrides(desired, (_b = roomSettings.roleTargetsByStage[stage]) != null ? _b : {});
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
  if (!COLONY_SETTINGS.pvp.enabled || roomSettings.disablePvP) return false;
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
  const visibleNeighbors = neighboringRooms(room);
  const allowedRemoteNeighbors = visibleNeighbors.filter((name) => isRemoteRoomAllowed(room.name, name));
  const scoutTargetRooms = visibleNeighbors;
  const reserveTargetRooms = strategy.capabilities.allowRemoteMining ? allowedRemoteNeighbors : [];
  const claimTargetRooms = strategy.capabilities.allowExpansion ? allowedRemoteNeighbors.filter((name) => {
    const targetRoom = Game.rooms[name];
    if (!(targetRoom == null ? void 0 : targetRoom.controller)) return true;
    return !targetRoom.controller.owner && !targetRoom.controller.reservation;
  }) : [];
  const attackTargetRooms = strategy.capabilities.allowOffense ? visibleNeighbors.filter((name) => {
    if (!isAttackAllowed(room.name, name)) return false;
    const targetRoom = Game.rooms[name];
    if (!targetRoom) return false;
    return targetRoom.find(FIND_HOSTILE_CREEPS).length > 0;
  }) : [];
  return {
    ...strategy,
    scoutTargetRooms,
    reserveTargetRooms,
    claimTargetRooms,
    attackTargetRooms
  };
}

// src/managers/colonyManager.ts
function runColonyManager() {
  var _a;
  for (const room of Object.values(Game.rooms)) {
    if (!((_a = room.controller) == null ? void 0 : _a.my)) continue;
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
      attackTargetRooms: []
    };
    const resolved = deriveTargetRooms(room, baseStrategy);
    if (!Memory.strategy) {
      Memory.strategy = {};
    }
    Memory.strategy[room.name] = resolved;
  }
}

// src/managers/constructionManager.ts
function placeIfFree(room, x, y, structureType) {
  if (x < 1 || x > 48 || y < 1 || y > 48) return;
  const look = room.lookForAt(LOOK_STRUCTURES, x, y);
  if (look.length > 0) return;
  const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
  if (sites.length > 0) return;
  room.createConstructionSite(x, y, structureType);
}
function placeExtensions(room, anchor) {
  var _a, _b, _c;
  const max = (_c = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][(_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0]) != null ? _c : 0;
  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site) => site.structureType === STRUCTURE_EXTENSION
  }).length;
  if (built + sites >= max) return;
  const offsets = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
    [2, 2],
    [2, -2],
    [-2, 2],
    [-2, -2],
    [3, 1],
    [3, -1],
    [-3, 1],
    [-3, -1],
    [1, 3],
    [-1, 3],
    [1, -3],
    [-1, -3]
  ];
  for (const [dx, dy] of offsets) {
    if (built + sites >= max) break;
    placeIfFree(room, anchor.x + dx, anchor.y + dy, STRUCTURE_EXTENSION);
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
    const mySpawn = room.find(FIND_MY_SPAWNS)[0];
    if (!mySpawn) continue;
    const strategy = (_b = Memory.strategy) == null ? void 0 : _b[room.name];
    if (!strategy) continue;
    const siteCount = room.find(FIND_CONSTRUCTION_SITES).length;
    if (siteCount > COLONY_SETTINGS.construction.maxRoomConstructionSites) continue;
    const anchor = mySpawn.pos;
    placeExtensions(room, anchor);
    placeSourceContainers(room, anchor);
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
function runDefenseManager() {
  const towers = _.filter(
    Object.values(Game.structures),
    (structure) => structure.structureType === STRUCTURE_TOWER && structure.my
  );
  for (const tower of towers) {
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      continue;
    }
    const wounded = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: (creep) => creep.hits < creep.hitsMax
    });
    if (wounded) {
      tower.heal(wounded);
      continue;
    }
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

// src/config/bodyPlans.ts
var ROLE_BODIES = {
  harvester: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 6 },
  hauler: { min: [CARRY, CARRY, MOVE], segment: [CARRY, CARRY, MOVE], maxSegments: 8 },
  miner: { min: [WORK, WORK, MOVE], segment: [WORK, WORK, MOVE], maxSegments: 5 },
  upgrader: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 8 },
  builder: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 6 },
  repairer: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 5 },
  waller: { min: [WORK, CARRY, MOVE], segment: [WORK, CARRY, MOVE], maxSegments: 7 },
  scout: { min: [MOVE], segment: [MOVE], maxSegments: 1 },
  reserver: { min: [CLAIM, MOVE], segment: [CLAIM, MOVE], maxSegments: 2 },
  claimer: { min: [CLAIM, MOVE], segment: [CLAIM, MOVE], maxSegments: 1 },
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
function runSpawnManager() {
  const spawns = Object.values(Game.spawns);
  for (const spawn of spawns) {
    if (spawn.spawning) continue;
    const role = nextRoleToSpawn(spawn);
    if (!role) continue;
    const energyBudget = spawn.room.energyAvailable;
    const body = buildBody(role, energyBudget);
    if (!body) continue;
    const name = `${role}-${spawn.room.name}-${Game.time}`;
    spawn.spawnCreep(body, name, {
      memory: {
        role,
        homeRoom: spawn.room.name,
        working: false
      }
    });
  }
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

// src/tasks/work.ts
function upgradeController(creep) {
  const controller = creep.room.controller;
  if (!controller) return false;
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
  if (!isAttackAllowed(creep.memory.homeRoom, roomName)) return false;
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
  var _a, _b, _c;
  const targets = (_c = (_b = (_a = Memory.strategy) == null ? void 0 : _a[creep.memory.homeRoom]) == null ? void 0 : _b.claimTargetRooms) != null ? _c : [];
  if (targets.length === 0) return;
  const targetRoom = targets[0];
  claimRoomController(creep, targetRoom);
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
function withdrawFromSourceContainers(creep) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      if (structure.structureType !== STRUCTURE_CONTAINER) return false;
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
function runHauler(creep) {
  updateWorkingState(creep);
  if (!creep.memory.working) {
    if (withdrawFromSourceContainers(creep)) return;
    if (withdrawStoredEnergy(creep)) return;
    pickupDroppedEnergy(creep);
    return;
  }
  fillPriorityEnergyTargets(creep);
}

// src/roles/miner.ts
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
  const container = sourceContainer(creep);
  if (container && creep.pos.getRangeTo(container) > 0) {
    creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: "#ffb703" } });
    return;
  }
  harvestEnergy(creep);
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
    case "upgrader":
      runUpgrader(creep);
      return;
    case "builder":
      runBuilder(creep);
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
  runColonyManager();
  runSpawnManager();
  runConstructionManager();
  runDefenseManager();
  for (const creep of Object.values(Game.creeps)) {
    runRole(creep);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loop
});
//# sourceMappingURL=main.js.map
