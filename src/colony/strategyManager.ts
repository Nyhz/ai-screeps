import type { ColonyStrategy } from "./types";
import {
  COLONY_SETTINGS,
  getBootstrapTargetRooms,
  getPendingManualClaimTargets,
  isAttackAllowed,
  isRemoteRoomAllowed
} from "../config/settings";

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function neighboringRooms(room: Room): string[] {
  const exits = Game.map.describeExits(room.name);
  if (!exits) return [];
  return unique(Object.values(exits));
}

export function deriveTargetRooms(room: Room, strategy: ColonyStrategy): ColonyStrategy {
  const visibleNeighbors = neighboringRooms(room);
  const allowedRemoteNeighbors = visibleNeighbors.filter((name) => isRemoteRoomAllowed(room.name, name));

  const scoutTargetRooms = visibleNeighbors;
  const reserveTargetRooms = strategy.capabilities.allowRemoteMining ? allowedRemoteNeighbors : [];

  const autoClaimTargetRooms = allowedRemoteNeighbors.filter((name) => {
    const targetRoom = Game.rooms[name];
    if (!targetRoom?.controller) return true;
    return !targetRoom.controller.owner && !targetRoom.controller.reservation;
  });

  const manualClaimTargetRooms = getPendingManualClaimTargets(room.name);
  const bootstrapTargetRooms = getBootstrapTargetRooms(room.name);
  const desiredClaimList = COLONY_SETTINGS.expansion.autoClaimNeighbors ? autoClaimTargetRooms : manualClaimTargetRooms;
  const claimTargetRooms = strategy.capabilities.allowExpansion && desiredClaimList.length > 0 ? [desiredClaimList[0]] : [];

  const attackTargetRooms = strategy.capabilities.allowOffense
    ? visibleNeighbors.filter((name) => {
        if (!isAttackAllowed(room.name, name)) return false;
        const targetRoom = Game.rooms[name];
        if (!targetRoom) return false;
        return targetRoom.find(FIND_HOSTILE_CREEPS).length > 0;
      })
    : [];

  const localThreat = Memory.threat?.[room.name];
  const shouldDefendLocalRoom =
    COLONY_SETTINGS.combat.defenseEnabled &&
    localThreat !== undefined &&
    localThreat.expiresAt >= Game.time &&
    localThreat.level !== "none";
  if (shouldDefendLocalRoom && !attackTargetRooms.includes(room.name)) {
    attackTargetRooms.unshift(room.name);
  }

  return {
    ...strategy,
    scoutTargetRooms,
    reserveTargetRooms,
    claimTargetRooms,
    bootstrapTargetRooms,
    attackTargetRooms
  };
}
