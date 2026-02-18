import { moveToRoomCenter } from "../tasks/movement";

function stableTargetRoom(creep: Creep, targets: string[]): string {
  const saved = creep.memory.targetRoom;
  if (saved && targets.includes(saved)) {
    return saved;
  }

  const hash = creep.name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const target = targets[hash % targets.length];
  creep.memory.targetRoom = target;
  return target;
}

export function runScout(creep: Creep): void {
  const targets = Memory.strategy?.[creep.memory.homeRoom]?.scoutTargetRooms ?? [];
  if (targets.length === 0) return;

  const targetRoom = stableTargetRoom(creep, targets);
  if (creep.room.name !== targetRoom) {
    moveToRoomCenter(creep, targetRoom);
    return;
  }

  creep.moveTo(25, 25, { reusePath: 5 });
}
