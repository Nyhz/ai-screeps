import { COLONY_SETTINGS } from "../config/settings";

export function moveToTarget(creep: Creep, target: RoomPosition | { pos: RoomPosition }, range = 1): void {
  creep.moveTo(target, {
    reusePath: 10,
    maxRooms: COLONY_SETTINGS.movement.maxRoomsPerPath,
    range: range ?? COLONY_SETTINGS.movement.defaultRange,
    visualizePathStyle: { stroke: "#8ecae6" }
  });
}

export function moveToRoomCenter(creep: Creep, roomName: string): void {
  const target = new RoomPosition(25, 25, roomName);
  moveToTarget(creep, target, 20);
}
