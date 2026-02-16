import { claimRoomController } from "../tasks/combat";

export function runClaimer(creep: Creep): void {
  const targets = Memory.strategy?.[creep.memory.homeRoom]?.claimTargetRooms ?? [];
  if (targets.length === 0) return;

  const targetRoom = targets[0];
  claimRoomController(creep, targetRoom);
}
