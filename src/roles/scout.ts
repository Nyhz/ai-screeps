import { moveToRoomCenter } from "../tasks/movement";

export function runScout(creep: Creep): void {
  const targets = Memory.strategy?.[creep.memory.homeRoom]?.scoutTargetRooms ?? [];
  if (targets.length === 0) return;

  const targetRoom = targets[Game.time % targets.length];
  if (creep.room.name !== targetRoom) {
    moveToRoomCenter(creep, targetRoom);
    return;
  }

  creep.moveTo(25, 25, { reusePath: 5 });
}
