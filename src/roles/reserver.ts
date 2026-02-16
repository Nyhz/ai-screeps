import { reserveRoomController } from "../tasks/combat";

export function runReserver(creep: Creep): void {
  const targets = Memory.strategy?.[creep.memory.homeRoom]?.reserveTargetRooms ?? [];
  if (targets.length === 0) return;

  const targetRoom = targets[Game.time % targets.length];
  reserveRoomController(creep, targetRoom);
}
