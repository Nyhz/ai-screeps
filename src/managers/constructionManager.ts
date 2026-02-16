function placeIfFree(room: Room, x: number, y: number, structureType: BuildableStructureConstant): void {
  if (x < 1 || x > 48 || y < 1 || y > 48) return;

  const look = room.lookForAt(LOOK_STRUCTURES, x, y);
  if (look.length > 0) return;

  const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
  if (sites.length > 0) return;

  room.createConstructionSite(x, y, structureType);
}

function placeExtensions(room: Room, anchor: RoomPosition): void {
  const max = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller?.level ?? 0] ?? 0;
  const built = room.find(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => structure.structureType === STRUCTURE_EXTENSION
  }).length;
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (site: ConstructionSite) => site.structureType === STRUCTURE_EXTENSION
  }).length;

  if (built + sites >= max) return;

  const offsets: Array<[number, number]> = [
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

    if (hasContainer > 0) continue;

    const path = anchor.findPathTo(source.pos, { ignoreCreeps: true });
    const finalStep = path[path.length - 1];
    if (!finalStep) continue;

    placeIfFree(room, finalStep.x, finalStep.y, STRUCTURE_CONTAINER);
  }
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
  if (Game.time % 37 !== 0) return;

  for (const room of Object.values(Game.rooms)) {
    if (!room.controller?.my) continue;

    const mySpawn = room.find(FIND_MY_SPAWNS)[0];
    if (!mySpawn) continue;

    const strategy = Memory.strategy?.[room.name];
    if (!strategy) continue;

    const siteCount = room.find(FIND_CONSTRUCTION_SITES).length;
    if (siteCount > 10) continue;

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
