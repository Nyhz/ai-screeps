function placeIfPossible(room: Room, x: number, y: number, structureType: BuildableStructureConstant): void {
  if (x < 1 || x > 48 || y < 1 || y > 48) return;
  room.createConstructionSite(x, y, structureType);
}

function stampExtensionsAroundSpawn(spawn: StructureSpawn): void {
  const room = spawn.room;
  const center = spawn.pos;

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
    [3, -1]
  ];

  for (const [dx, dy] of offsets) {
    placeIfPossible(room, center.x + dx, center.y + dy, STRUCTURE_EXTENSION);
  }
}

function connectSpawnToController(spawn: StructureSpawn): void {
  const controller = spawn.room.controller;
  if (!controller) return;
  const path = spawn.pos.findPathTo(controller.pos, { ignoreCreeps: true });
  for (const step of path) {
    spawn.room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
  }
}

function placeSourceContainers(spawn: StructureSpawn): void {
  const sources = spawn.room.find(FIND_SOURCES);
  for (const source of sources) {
    const path = spawn.pos.findPathTo(source.pos, { ignoreCreeps: true });
    const end = path[path.length - 1];
    if (end) {
      spawn.room.createConstructionSite(end.x, end.y, STRUCTURE_CONTAINER);
    }
  }
}

export function runRooms(): void {
  if (Game.time % 53 !== 0) return;

  const spawns = Object.values(Game.spawns);
  for (const spawn of spawns) {
    const room = spawn.room;
    const rcl = room.controller?.level ?? 0;
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
