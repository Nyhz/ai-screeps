import { attackInRoom } from "../tasks/combat";

function hasActiveThreat(roomName: string): boolean {
  const threat = Memory.threat?.[roomName];
  return Boolean(threat && threat.expiresAt >= Game.time && threat.level !== "none");
}

function roomStillNeedsCombat(roomName: string): boolean {
  const room = Game.rooms[roomName];
  if (!room) return true;
  if (room.find(FIND_HOSTILE_CREEPS).length > 0) return true;

  if (room.controller?.my && hasActiveThreat(roomName)) {
    return true;
  }

  return false;
}

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

export function runSoldier(creep: Creep): void {
  if (creep.memory.targetRoom) {
    const pinned = creep.memory.targetRoom;
    const stillRelevant = roomStillNeedsCombat(pinned);
    if (stillRelevant) {
      if (attackInRoom(creep, pinned)) return;
    } else {
      delete creep.memory.targetRoom;
    }
  }

  const targets = Memory.strategy?.[creep.memory.homeRoom]?.attackTargetRooms ?? [];
  if (targets.length === 0) return;

  const targetRoom = stableTargetRoom(creep, targets);
  attackInRoom(creep, targetRoom);
}
