import { collectRoomSnapshot } from "../colony/intel";
import { deriveDesiredRoles } from "../colony/spawnPlanner";
import { deriveStageAndCapabilities } from "../colony/stageManager";
import { deriveTargetRooms } from "../colony/strategyManager";
import { syncExpansionStateForHome } from "../config/settings";
import type { ColonyStrategy } from "../colony/types";

export function runColonyManager(): void {
  for (const room of Object.values(Game.rooms)) {
    if (!room.controller?.my) continue;
    syncExpansionStateForHome(room.name);

    const snapshot = collectRoomSnapshot(room);
    const { stage, capabilities } = deriveStageAndCapabilities(snapshot);
    const desiredRoles = deriveDesiredRoles(snapshot, stage, capabilities);

    const baseStrategy: ColonyStrategy = {
      stage,
      capabilities,
      desiredRoles,
      scoutTargetRooms: [],
      reserveTargetRooms: [],
      claimTargetRooms: [],
      bootstrapTargetRooms: [],
      attackTargetRooms: []
    };

    const resolved = deriveTargetRooms(room, baseStrategy);

    if (!Memory.strategy) {
      Memory.strategy = {};
    }

    Memory.strategy[room.name] = resolved;
  }
}
