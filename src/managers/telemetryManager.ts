import { COLONY_SETTINGS } from "../config/settings";
import { countCreepsByHomeRoomAndRole, getOwnedRooms } from "../runtime/tickCache";

function summarizeThreat(roomName: string): string {
  const threat = Memory.threat?.[roomName];
  if (!threat || threat.expiresAt < Game.time) return "none";
  return `${threat.level}:${threat.score}`;
}

export function runTelemetryManager(): void {
  if (!COLONY_SETTINGS.telemetry.enabled) return;
  if (Game.time % COLONY_SETTINGS.telemetry.interval !== 0) return;

  for (const room of getOwnedRooms()) {
    const state = Memory.roomState?.[room.name] ?? "unknown";
    const threat = summarizeThreat(room.name);
    const strategy = Memory.strategy?.[room.name];
    const claim = strategy?.claimTargetRooms[0] ?? "-";
    const bootstrap = strategy?.bootstrapTargetRooms.join(",") ?? "-";
    const soldiers = countCreepsByHomeRoomAndRole(room.name, "soldier");

    console.log(
      `[telemetry][${room.name}] state=${state} threat=${threat} soldiers=${soldiers} claim=${claim} bootstrap=${bootstrap}`
    );
  }
}
