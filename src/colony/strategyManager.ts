import type { ColonyStrategy } from "./types";

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

  const scoutTargetRooms = visibleNeighbors;
  const reserveTargetRooms = strategy.capabilities.allowRemoteMining ? visibleNeighbors : [];

  const claimTargetRooms = strategy.capabilities.allowExpansion
    ? visibleNeighbors.filter((name) => {
        const targetRoom = Game.rooms[name];
        if (!targetRoom?.controller) return true;
        return !targetRoom.controller.owner && !targetRoom.controller.reservation;
      })
    : [];

  const attackTargetRooms = strategy.capabilities.allowOffense
    ? visibleNeighbors.filter((name) => {
        const targetRoom = Game.rooms[name];
        if (!targetRoom) return false;
        return targetRoom.find(FIND_HOSTILE_CREEPS).length > 0;
      })
    : [];

  return {
    ...strategy,
    scoutTargetRooms,
    reserveTargetRooms,
    claimTargetRooms,
    attackTargetRooms
  };
}
