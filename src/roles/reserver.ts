import { reserveRoomController } from "../tasks/combat";

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

export function runReserver(creep: Creep): void {
  const targets = Memory.strategy?.[creep.memory.homeRoom]?.reserveTargetRooms ?? [];
  if (targets.length === 0) return;

  const targetRoom = stableTargetRoom(creep, targets);
  reserveRoomController(creep, targetRoom);
}
