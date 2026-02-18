import { COLONY_SETTINGS } from "../config/settings";
import { getRoomAnchor } from "../colony/layoutPlanner";
import { getOwnedRooms } from "../runtime/tickCache";
import { roomMineral } from "../tasks/minerals";

const CORE_RESERVED_OFFSETS = new Set<string>([
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

const CORE_EXTENSION_OFFSETS: Array<[number, number]> = [
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

function placeIfFree(room: Room, x: number, y: number, structureType: BuildableStructureConstant): boolean {
  if (x < 1 || x > 48 || y < 1 || y > 48) return false;
  if (room.getTerrain().get(x, y) === TERRAIN_MASK_WALL) return false;

  const look = room.lookForAt(LOOK_STRUCTURES, x, y);
  if (look.length > 0) return false;

  const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
  if (sites.length > 0) return false;

  return room.createConstructionSite(x, y, structureType) === OK;
}

function extensionBuiltAndSiteCount(room: Room): number {
  const max = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller?.level ?? 0] ?? 0;
  if (max === 0) return 0;

  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site: ConstructionSite) => site.structureType === STRUCTURE_EXTENSION
  }).length;

  return built + sites;
}

function sourceExtensionBuiltAndSiteCount(room: Room): number {
  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => isSourceExtensionPosition(room, structure)
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site: ConstructionSite) => {
      if (site.structureType !== STRUCTURE_EXTENSION) return false;
      const sources = room.find(FIND_SOURCES);
      return sources.some((source) => site.pos.getRangeTo(source) <= 2);
    }
  }).length;
  return built + sites;
}

function maxExtensions(room: Room): number {
  return CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller?.level ?? 0] ?? 0;
}

function structureBuiltAndSiteCount(room: Room, structureType: BuildableStructureConstant): number {
  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => structure.structureType === structureType
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site: ConstructionSite) => site.structureType === structureType
  }).length;
  return built + sites;
}

function structureRemainingCapacity(room: Room, structureType: BuildableStructureConstant): number {
  const max = CONTROLLER_STRUCTURES[structureType][room.controller?.level ?? 0] ?? 0;
  if (max <= 0) return 0;
  const used = structureBuiltAndSiteCount(room, structureType);
  return Math.max(0, max - used);
}

function isFreeBuildTile(room: Room, x: number, y: number): boolean {
  if (x < 1 || x > 48 || y < 1 || y > 48) return false;
  if (room.getTerrain().get(x, y) === TERRAIN_MASK_WALL) return false;
  if (room.lookForAt(LOOK_STRUCTURES, x, y).length > 0) return false;
  if (room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y).length > 0) return false;
  return true;
}

function hasPendingSourceExtensionCandidates(room: Room, anchor: RoomPosition): boolean {
  const perSource = Math.max(0, COLONY_SETTINGS.construction.sourceExtensionsPerSource);
  if (perSource === 0) return false;

  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    const existing = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
      filter: (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
    }).length;
    const pending = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
      filter: (site: ConstructionSite) => site.structureType === STRUCTURE_EXTENSION
    }).length;

    if (existing + pending >= perSource) continue;

    const candidates = extensionCandidatesNearSource(room, anchor, source);
    if (candidates.some(([x, y]) => isFreeBuildTile(room, x, y))) {
      return true;
    }
  }

  return false;
}

function sourceExtensionTargetCount(room: Room): number {
  const perSource = Math.max(0, COLONY_SETTINGS.construction.sourceExtensionsPerSource);
  if (perSource === 0) return 0;
  return room.find(FIND_SOURCES).length * perSource;
}

function placeCoreExtensions(room: Room, anchor: RoomPosition): void {
  const max = maxExtensions(room);
  if (max === 0) return;

  const sourceTarget = Math.min(max, sourceExtensionTargetCount(room));
  const sourcePlaced = sourceExtensionBuiltAndSiteCount(room);
  const sourceCanStillGrow = shouldPlaceSourceExtensions(room) && hasPendingSourceExtensionCandidates(room, anchor);
  const reservedForSources = sourceCanStillGrow ? sourceTarget : sourcePlaced;
  const coreCap = Math.max(0, max - reservedForSources);

  let used = extensionBuiltAndSiteCount(room);
  if (used >= coreCap) return;

  for (const [dx, dy] of CORE_EXTENSION_OFFSETS) {
    if (used >= coreCap) break;
    if (CORE_RESERVED_OFFSETS.has(`${dx},${dy}`)) continue;

    placeIfFree(room, anchor.x + dx, anchor.y + dy, STRUCTURE_EXTENSION);
    used = extensionBuiltAndSiteCount(room);
  }
}

function isSourceExtensionPosition(room: Room, structure: Structure): boolean {
  if (structure.structureType !== STRUCTURE_EXTENSION) return false;
  const sources = room.find(FIND_SOURCES);
  return sources.some((source) => structure.pos.getRangeTo(source) <= 2);
}

function sourceExtensionAvgFill(room: Room): number {
  const sourceExtensions = room.find(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => isSourceExtensionPosition(room, structure)
  }) as StructureExtension[];

  if (sourceExtensions.length === 0) return 0;

  const ratios = sourceExtensions.map((extension) => {
    const used = extension.store.getUsedCapacity(RESOURCE_ENERGY);
    const total = extension.store.getCapacity(RESOURCE_ENERGY);
    if (!total) return 0;
    return used / total;
  });

  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
}

function shouldPlaceSourceExtensions(room: Room): boolean {
  const rcl = room.controller?.level ?? 0;
  if (rcl < COLONY_SETTINGS.construction.sourceExtensionsMinRcl) return false;

  if (COLONY_SETTINGS.construction.requireEnergyCapForSourceExtensions) {
    if (room.energyAvailable < room.energyCapacityAvailable) return false;
  }

  return sourceExtensionAvgFill(room) <= COLONY_SETTINGS.construction.sourceExtensionMaxAvgFillRatioToExpand;
}

function extensionCandidatesNearSource(room: Room, anchor: RoomPosition, source: Source): Array<[number, number]> {
  const terrain = room.getTerrain();
  const positions: Array<[number, number]> = [];

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

function containerCandidatesNearSource(room: Room, anchor: RoomPosition, source: Source): Array<[number, number]> {
  const terrain = room.getTerrain();
  const positions: Array<[number, number]> = [];

  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      if (dx === 0 && dy === 0) continue;

      const x = source.pos.x + dx;
      const y = source.pos.y + dy;
      if (x < 1 || x > 48 || y < 1 || y > 48) continue;
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

      positions.push([x, y]);
    }
  }

  positions.sort((a, b) => anchor.getRangeTo(a[0], a[1]) - anchor.getRangeTo(b[0], b[1]));
  return positions;
}

function placeSourceExtensions(room: Room, anchor: RoomPosition): void {
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
        filter: (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
      }).length;
      const pending = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
        filter: (site: ConstructionSite) => site.structureType === STRUCTURE_EXTENSION
      }).length;

      if (existing + pending >= perSource) break;

      placeIfFree(room, x, y, STRUCTURE_EXTENSION);
      used = extensionBuiltAndSiteCount(room);
    }
  }
}

function placeRoadsFromAnchor(room: Room, anchor: RoomPosition): void {
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

function placeSourceContainers(room: Room, anchor: RoomPosition): void {
  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    const hasContainer = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure: Structure) => structure.structureType === STRUCTURE_CONTAINER
    }).length;
    const hasContainerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: (site: ConstructionSite) => site.structureType === STRUCTURE_CONTAINER
    }).length;

    if (hasContainer + hasContainerSite > 0) continue;

    const candidates = containerCandidatesNearSource(room, anchor, source);
    for (const [x, y] of candidates) {
      if (placeIfFree(room, x, y, STRUCTURE_CONTAINER)) {
        break;
      }
    }
  }
}

function sourceContainerDeficit(room: Room): number {
  const sources = room.find(FIND_SOURCES);
  let deficit = 0;

  for (const source of sources) {
    const hasContainer = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure: Structure) => structure.structureType === STRUCTURE_CONTAINER
    }).length;
    const hasContainerSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: (site: ConstructionSite) => site.structureType === STRUCTURE_CONTAINER
    }).length;
    if (hasContainer + hasContainerSite === 0) {
      deficit += 1;
    }
  }

  return deficit;
}

function placeTowers(room: Room, anchor: RoomPosition): void {
  const max = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][room.controller?.level ?? 0] ?? 0;
  if (max === 0) return;

  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => structure.structureType === STRUCTURE_TOWER
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site: ConstructionSite) => site.structureType === STRUCTURE_TOWER
  }).length;

  if (built + sites >= max) return;

  placeIfFree(room, anchor.x + 3, anchor.y, STRUCTURE_TOWER);
  placeIfFree(room, anchor.x - 3, anchor.y, STRUCTURE_TOWER);
  placeIfFree(room, anchor.x, anchor.y + 3, STRUCTURE_TOWER);
}

function placeCoreLogistics(room: Room, anchor: RoomPosition): void {
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

function placeLabCluster(room: Room, anchor: RoomPosition): void {
  let remaining = structureRemainingCapacity(room, STRUCTURE_LAB);
  if (remaining <= 0) return;

  const offsets: Array<[number, number]> = [
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
    if (placeIfFree(room, anchor.x + dx, anchor.y + dy, STRUCTURE_LAB)) {
      remaining -= 1;
    }
  }
}

function placeSourceAndControllerLinks(room: Room, anchor: RoomPosition): void {
  let remaining = structureRemainingCapacity(room, STRUCTURE_LINK);
  if (remaining <= 0) return;

  if (room.controller) {
    const existingNearController = room.controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {
      filter: (structure: Structure) => structure.structureType === STRUCTURE_LINK
    }).length;
    const sitesNearController = room.controller.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
      filter: (site: ConstructionSite) => site.structureType === STRUCTURE_LINK
    }).length;

    if (existingNearController + sitesNearController === 0) {
      const path = anchor.findPathTo(room.controller.pos, { ignoreCreeps: true });
      const finalStep = path[path.length - 1];
      if (finalStep) {
        if (placeIfFree(room, finalStep.x, finalStep.y, STRUCTURE_LINK)) {
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
      filter: (structure: Structure) => structure.structureType === STRUCTURE_LINK
    }).length;
    const sites = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
      filter: (site: ConstructionSite) => site.structureType === STRUCTURE_LINK
    }).length;
    if (existing + sites > 0) continue;

    const path = anchor.findPathTo(source.pos, { ignoreCreeps: true });
    const finalStep = path[path.length - 1];
    if (!finalStep) continue;

    if (placeIfFree(room, finalStep.x, finalStep.y, STRUCTURE_LINK)) {
      remaining -= 1;
    }
  }
}

function placeMineralInfrastructure(room: Room, anchor: RoomPosition): void {
  if (!COLONY_SETTINGS.minerals.enabled) return;
  if ((room.controller?.level ?? 0) < COLONY_SETTINGS.minerals.minRcl) return;

  const mineral = roomMineral(room);
  if (!mineral) return;

  const extractorExists = mineral.pos.lookFor(LOOK_STRUCTURES).some((structure) => structure.structureType === STRUCTURE_EXTRACTOR);
  const extractorSiteExists = mineral.pos
    .lookFor(LOOK_CONSTRUCTION_SITES)
    .some((site) => site.structureType === STRUCTURE_EXTRACTOR);

  if (!extractorExists && !extractorSiteExists) {
    room.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
  }

  const hasContainer = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: (structure: Structure) => structure.structureType === STRUCTURE_CONTAINER
  }).length;
  const hasContainerSite = mineral.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
    filter: (site: ConstructionSite) => site.structureType === STRUCTURE_CONTAINER
  }).length;

  if (hasContainer + hasContainerSite === 0) {
    const path = anchor.findPathTo(mineral.pos, { ignoreCreeps: true });
    const finalStep = path[path.length - 1];
    if (finalStep) {
      placeIfFree(room, finalStep.x, finalStep.y, STRUCTURE_CONTAINER);
    }
  }

  if (Memory.strategy?.[room.name]?.capabilities.allowRoads) {
    const path = anchor.findPathTo(mineral.pos, { ignoreCreeps: true });
    for (const step of path) {
      placeIfFree(room, step.x, step.y, STRUCTURE_ROAD);
    }
  }
}

function placeDefensiveRing(room: Room, anchor: RoomPosition): void {
  for (let dx = -4; dx <= 4; dx += 1) {
    for (let dy = -4; dy <= 4; dy += 1) {
      const onEdge = Math.abs(dx) === 4 || Math.abs(dy) === 4;
      if (!onEdge) continue;
      placeIfFree(room, anchor.x + dx, anchor.y + dy, STRUCTURE_WALL);
    }
  }
}

export function runConstructionManager(): void {
  if (Game.time % COLONY_SETTINGS.construction.runInterval !== 0) return;

  for (const room of getOwnedRooms()) {

    const strategy = Memory.strategy?.[room.name];
    if (!strategy) continue;

    const anchor = getRoomAnchor(room);
    if (!anchor) continue;

    const maxSites = COLONY_SETTINGS.construction.maxRoomConstructionSites;

    if (COLONY_SETTINGS.construction.autoPlaceSpawnInClaimedRooms) {
      const hasSpawn = room.find(FIND_MY_SPAWNS).length > 0;
      const hasSpawnSite = room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (site: ConstructionSite) => site.structureType === STRUCTURE_SPAWN
      }).length;

      if (!hasSpawn && hasSpawnSite === 0 && room.find(FIND_CONSTRUCTION_SITES).length < maxSites) {
        placeIfFree(room, anchor.x, anchor.y, STRUCTURE_SPAWN);
      }
    }

    // Reserve construction-site budget for one source container per source before expanding other queues.
    const reservedContainerSlots = Math.max(0, sourceContainerDeficit(room));
    const nonContainerSiteBudget = Math.max(0, maxSites - reservedContainerSlots);

    placeSourceContainers(room, anchor);

    const siteCountAfterContainers = room.find(FIND_CONSTRUCTION_SITES).length;
    if (siteCountAfterContainers >= nonContainerSiteBudget) continue;
    if (siteCountAfterContainers >= maxSites) continue;

    placeSourceExtensions(room, anchor);
    if (room.find(FIND_CONSTRUCTION_SITES).length >= maxSites) continue;
    placeCoreExtensions(room, anchor);
    if (room.find(FIND_CONSTRUCTION_SITES).length >= maxSites) continue;
    placeCoreLogistics(room, anchor);
    if (room.find(FIND_CONSTRUCTION_SITES).length >= maxSites) continue;
    placeLabCluster(room, anchor);
    if (room.find(FIND_CONSTRUCTION_SITES).length >= maxSites) continue;
    placeSourceAndControllerLinks(room, anchor);
    if (room.find(FIND_CONSTRUCTION_SITES).length >= maxSites) continue;
    placeMineralInfrastructure(room, anchor);

    if (strategy.capabilities.allowRoads) {
      if (room.find(FIND_CONSTRUCTION_SITES).length >= maxSites) continue;
      placeRoadsFromAnchor(room, anchor);
    }

    if (strategy.capabilities.allowTowers) {
      if (room.find(FIND_CONSTRUCTION_SITES).length >= maxSites) continue;
      placeTowers(room, anchor);
    }

    if (strategy.capabilities.allowWalls) {
      if (room.find(FIND_CONSTRUCTION_SITES).length >= maxSites) continue;
      placeDefensiveRing(room, anchor);
    }
  }
}
