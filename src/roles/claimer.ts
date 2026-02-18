import { claimRoomController } from "../tasks/combat";
import { markManualTargetClaimed } from "../config/settings";

export function runClaimer(creep: Creep): void {
  const targets = Memory.strategy?.[creep.memory.homeRoom]?.claimTargetRooms ?? [];
  if (targets.length === 0) return;

  const targetRoom = targets[0];
  if (claimRoomController(creep, targetRoom)) {
    if (creep.room.name === targetRoom && creep.room.controller?.my) {
      markManualTargetClaimed(creep.memory.homeRoom, targetRoom);
    }
  }
}
