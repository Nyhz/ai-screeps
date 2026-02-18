import { ROLE_ORDER, type RoleName } from "../config/roles";

interface RoomCreepBuckets {
  creeps: Creep[];
  byRole: Record<RoleName, Creep[]>;
}

let cachedTick = -1;
let allCreeps: Creep[] = [];
let ownedRooms: Room[] = [];
let creepsByHomeRoom: Record<string, RoomCreepBuckets> = {};

function emptyRoleBuckets(): Record<RoleName, Creep[]> {
  const byRole = {} as Record<RoleName, Creep[]>;
  for (const role of ROLE_ORDER) {
    byRole[role] = [];
  }
  return byRole;
}

function ensureFreshTickCache(): void {
  if (cachedTick === Game.time) return;

  cachedTick = Game.time;
  allCreeps = Object.values(Game.creeps);
  ownedRooms = Object.values(Game.rooms).filter((room) => room.controller?.my);
  creepsByHomeRoom = {};

  for (const creep of allCreeps) {
    const homeRoom = creep.memory.homeRoom ?? creep.room.name;
    if (!creepsByHomeRoom[homeRoom]) {
      creepsByHomeRoom[homeRoom] = {
        creeps: [],
        byRole: emptyRoleBuckets()
      };
    }

    const bucket = creepsByHomeRoom[homeRoom];
    bucket.creeps.push(creep);
    bucket.byRole[creep.memory.role].push(creep);
  }
}

export function getAllCreeps(): Creep[] {
  ensureFreshTickCache();
  return allCreeps;
}

export function getOwnedRooms(): Room[] {
  ensureFreshTickCache();
  return ownedRooms;
}

export function getCreepsByHomeRoom(roomName: string): Creep[] {
  ensureFreshTickCache();
  return creepsByHomeRoom[roomName]?.creeps ?? [];
}

export function getCreepsByHomeRoomAndRole(roomName: string, role: RoleName): Creep[] {
  ensureFreshTickCache();
  return creepsByHomeRoom[roomName]?.byRole[role] ?? [];
}

export function countCreepsByHomeRoomAndRole(roomName: string, role: RoleName): number {
  return getCreepsByHomeRoomAndRole(roomName, role).length;
}
