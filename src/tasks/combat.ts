import { moveToRoomCenter, moveToTarget } from "./movement";

export function reserveRoomController(creep: Creep, roomName: string): boolean {
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

export function claimRoomController(creep: Creep, roomName: string): boolean {
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

export function attackInRoom(creep: Creep, roomName: string): boolean {
  if (creep.room.name !== roomName) {
    moveToRoomCenter(creep, roomName);
    return true;
  }

  const hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
  if (hostile) {
    const result = creep.attack(hostile);
    if (result === ERR_NOT_IN_RANGE) {
      moveToTarget(creep, hostile);
      return true;
    }

    return result === OK;
  }

  const hostileStructure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
    filter: (structure: Structure) => structure.structureType !== STRUCTURE_CONTROLLER
  });

  if (!hostileStructure) return false;

  const result = creep.attack(hostileStructure);
  if (result === ERR_NOT_IN_RANGE) {
    moveToTarget(creep, hostileStructure);
    return true;
  }

  return result === OK;
}
