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

// src/roles/builder.ts
function runBuilder(creep) {
  if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.working = false;
  }
  if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }
  if (creep.memory.working) {
    const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (site) {
      if (creep.build(site) === ERR_NOT_IN_RANGE) {
        creep.moveTo(site, { visualizePathStyle: { stroke: "#ab47bc" } });
      }
      return;
    }
    const controller = creep.room.controller;
    if (!controller) return;
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller, { visualizePathStyle: { stroke: "#66bb6a" } });
    }
    return;
  }
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });
  if (container) {
    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, { visualizePathStyle: { stroke: "#ffa726" } });
    }
    return;
  }
  const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (!source) return;
  if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
    creep.moveTo(source, { visualizePathStyle: { stroke: "#ffa726" } });
  }
}

// src/utils.ts
function countRole(role) {
  return _.filter(Game.creeps, (creep) => creep.memory.role === role).length;
}
function nearestEnergyTarget(creep) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  });
  if (!target) return null;
  return target;
}
function cleanupMemory() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

// src/roles/harvester.ts
function runHarvester(creep) {
  if (creep.store.getFreeCapacity() > 0) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (!source) return;
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#f5c542" } });
    }
    return;
  }
  const target = nearestEnergyTarget(creep);
  if (!target) {
    const controller = creep.room.controller;
    if (!controller) return;
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" } });
    }
    return;
  }
  if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target, { visualizePathStyle: { stroke: "#42a5f5" } });
  }
}

// src/roles/upgrader.ts
function runUpgrader(creep) {
  const controller = creep.room.controller;
  if (!controller) return;
  if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.working = false;
  }
  if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }
  if (creep.memory.working) {
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller, { visualizePathStyle: { stroke: "#66bb6a" } });
    }
    return;
  }
  const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });
  if (container) {
    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, { visualizePathStyle: { stroke: "#ffa726" } });
    }
    return;
  }
  const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (!source) return;
  if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
    creep.moveTo(source, { visualizePathStyle: { stroke: "#ffa726" } });
  }
}

// src/roomManager.ts
function placeIfPossible(room, x, y, structureType) {
  if (x < 1 || x > 48 || y < 1 || y > 48) return;
  room.createConstructionSite(x, y, structureType);
}
function stampExtensionsAroundSpawn(spawn) {
  const room = spawn.room;
  const center = spawn.pos;
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
    [3, -1]
  ];
  for (const [dx, dy] of offsets) {
    placeIfPossible(room, center.x + dx, center.y + dy, STRUCTURE_EXTENSION);
  }
}
function connectSpawnToController(spawn) {
  const controller = spawn.room.controller;
  if (!controller) return;
  const path = spawn.pos.findPathTo(controller.pos, { ignoreCreeps: true });
  for (const step of path) {
    spawn.room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
  }
}
function placeSourceContainers(spawn) {
  const sources = spawn.room.find(FIND_SOURCES);
  for (const source of sources) {
    const path = spawn.pos.findPathTo(source.pos, { ignoreCreeps: true });
    const end = path[path.length - 1];
    if (end) {
      spawn.room.createConstructionSite(end.x, end.y, STRUCTURE_CONTAINER);
    }
  }
}
function runRooms() {
  var _a, _b;
  if (Game.time % 53 !== 0) return;
  const spawns = Object.values(Game.spawns);
  for (const spawn of spawns) {
    const room = spawn.room;
    const rcl = (_b = (_a = room.controller) == null ? void 0 : _a.level) != null ? _b : 0;
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length > 6) continue;
    if (rcl >= 2) {
      stampExtensionsAroundSpawn(spawn);
      placeSourceContainers(spawn);
    }
    if (rcl >= 3) {
      placeIfPossible(room, spawn.pos.x + 3, spawn.pos.y, STRUCTURE_TOWER);
      connectSpawnToController(spawn);
    }
  }
}

// src/spawnManager.ts
var BODY_BY_ROLE = {
  harvester: [WORK, WORK, CARRY, MOVE],
  upgrader: [WORK, CARRY, CARRY, MOVE, MOVE],
  builder: [WORK, CARRY, CARRY, MOVE, MOVE]
};
function runSpawns() {
  const spawns = Object.values(Game.spawns);
  for (const spawn of spawns) {
    if (spawn.spawning) continue;
    const harvesterCount = countRole("harvester");
    const upgraderCount = countRole("upgrader");
    const builderCount = countRole("builder");
    const sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
    const targetBuilders = sites.length > 0 ? 2 : 1;
    let nextRole = null;
    if (harvesterCount < 3) nextRole = "harvester";
    else if (upgraderCount < 3) nextRole = "upgrader";
    else if (builderCount < targetBuilders) nextRole = "builder";
    if (!nextRole) continue;
    const name = `${nextRole}-${Game.time}`;
    const body = BODY_BY_ROLE[nextRole];
    spawn.spawnCreep(body, name, { memory: { role: nextRole, working: false } });
  }
}

// src/towerManager.ts
function runTowers() {
  const towers = _.filter(
    Object.values(Game.structures),
    (structure) => structure.structureType === STRUCTURE_TOWER
  );
  for (const tower of towers) {
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
      continue;
    }
    const mostDamaged = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 2e5 && structure.structureType !== STRUCTURE_WALL
    });
    if (mostDamaged) {
      tower.repair(mostDamaged);
    }
  }
}

// src/main.ts
function runCreep(creep) {
  if (creep.memory.role === "harvester") {
    runHarvester(creep);
    return;
  }
  if (creep.memory.role === "upgrader") {
    runUpgrader(creep);
    return;
  }
  if (creep.memory.role === "builder") {
    runBuilder(creep);
  }
}
var loop = () => {
  cleanupMemory();
  runRooms();
  runSpawns();
  runTowers();
  for (const name in Game.creeps) {
    runCreep(Game.creeps[name]);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loop
});
//# sourceMappingURL=main.js.map
