import { COLONY_SETTINGS } from "../config/settings";

function summarizeThreat(roomName: string): string {
  const threat = Memory.threat?.[roomName];
  if (!threat || threat.expiresAt < Game.time) return "none";
  return `${threat.level}:${threat.score}`;
}

export function runTelemetryManager(): void {
  if (!COLONY_SETTINGS.telemetry.enabled) return;
  if (Game.time % COLONY_SETTINGS.telemetry.interval !== 0) return;

  const ownedRooms = Object.values(Game.rooms).filter((room) => room.controller?.my);
  for (const room of ownedRooms) {
    const state = Memory.roomState?.[room.name] ?? "unknown";
    const threat = summarizeThreat(room.name);
    const strategy = Memory.strategy?.[room.name];
    const claim = strategy?.claimTargetRooms[0] ?? "-";
    const bootstrap = strategy?.bootstrapTargetRooms.join(",") ?? "-";
    const soldiers = Object.values(Game.creeps).filter(
      (creep) => creep.memory.homeRoom === room.name && creep.memory.role === "soldier"
    ).length;

    console.log(
      `[telemetry][${room.name}] state=${state} threat=${threat} soldiers=${soldiers} claim=${claim} bootstrap=${bootstrap}`
    );
  }
}
