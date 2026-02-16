import { attackInRoom } from "../tasks/combat";

export function runSoldier(creep: Creep): void {
  const targets = Memory.strategy?.[creep.memory.homeRoom]?.attackTargetRooms ?? [];
  if (targets.length === 0) return;

  const targetRoom = targets[Game.time % targets.length];
  attackInRoom(creep, targetRoom);
}
