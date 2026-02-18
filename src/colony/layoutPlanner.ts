import { COLONY_SETTINGS } from "../config/settings";

interface CandidateScore {
  x: number;
  y: number;
  score: number;
}

function isWalkable(room: Room, x: number, y: number): boolean {
  if (x < 1 || x > 48 || y < 1 || y > 48) return false;
  return room.getTerrain().get(x, y) !== TERRAIN_MASK_WALL;
}

function edgePenalty(x: number, y: number): number {
  const distanceToEdge = Math.min(x, 49 - x, y, 49 - y);
  if (distanceToEdge >= COLONY_SETTINGS.layout.minEdgeDistance) return 0;
  return (COLONY_SETTINGS.layout.minEdgeDistance - distanceToEdge) * 20;
}

function walkableAreaScore(room: Room, x: number, y: number): number {
  let walkable = 0;

  for (let dx = -4; dx <= 4; dx += 1) {
    for (let dy = -4; dy <= 4; dy += 1) {
      if (isWalkable(room, x + dx, y + dy)) {
        walkable += 1;
      }
    }
  }

  return walkable * 2;
}

function distanceScore(distance: number, desired: number): number {
  return Math.max(0, 50 - Math.abs(distance - desired) * 4);
}

function scoreAnchor(room: Room, x: number, y: number): number {
  if (!isWalkable(room, x, y)) return Number.NEGATIVE_INFINITY;

  const look = room.lookForAt(LOOK_STRUCTURES, x, y);
  if (look.length > 0) return Number.NEGATIVE_INFINITY;

  let score = walkableAreaScore(room, x, y);
  score -= edgePenalty(x, y);

  const controller = room.controller;
  if (controller) {
    score += distanceScore(controller.pos.getRangeTo(x, y), COLONY_SETTINGS.layout.desiredControllerRange);
  }

  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    score += distanceScore(source.pos.getRangeTo(x, y), COLONY_SETTINGS.layout.desiredSourceRange);
  }

  return score;
}

function bestAnchorCandidate(room: Room): CandidateScore | null {
  let best: CandidateScore | null = null;

  for (let x = COLONY_SETTINGS.layout.scanMin; x <= COLONY_SETTINGS.layout.scanMax; x += 1) {
    for (let y = COLONY_SETTINGS.layout.scanMin; y <= COLONY_SETTINGS.layout.scanMax; y += 1) {
      const score = scoreAnchor(room, x, y);
      if (!Number.isFinite(score)) continue;

      if (!best || score > best.score) {
        best = { x, y, score };
      }
    }
  }

  return best;
}

export function getRoomAnchor(room: Room): RoomPosition | null {
  if (!Memory.roomPlans) {
    Memory.roomPlans = {};
  }

  const cached = Memory.roomPlans[room.name];
  if (cached && isWalkable(room, cached.anchorX, cached.anchorY)) {
    return new RoomPosition(cached.anchorX, cached.anchorY, room.name);
  }

  const spawn = room.find(FIND_MY_SPAWNS)[0];
  if (spawn) {
    Memory.roomPlans[room.name] = {
      anchorX: spawn.pos.x,
      anchorY: spawn.pos.y,
      score: 0,
      createdAt: Game.time
    };
    return spawn.pos;
  }

  const candidate = bestAnchorCandidate(room);
  if (!candidate) return null;

  Memory.roomPlans[room.name] = {
    anchorX: candidate.x,
    anchorY: candidate.y,
    score: candidate.score,
    createdAt: Game.time
  };

  return new RoomPosition(candidate.x, candidate.y, room.name);
}
