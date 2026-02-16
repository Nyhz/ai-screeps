import type { RoleName } from "./config/roles";

const PART_COST: Record<BodyPartConstant, number> = {
  move: 50,
  work: 100,
  carry: 50,
  attack: 80,
  ranged_attack: 150,
  tough: 10,
  heal: 250,
  claim: 600
};

export function bodyCost(body: BodyPartConstant[]): number {
  return body.reduce((sum, part) => sum + PART_COST[part], 0);
}

export function countRoleInRoom(roomName: string, role: RoleName): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    if (creep.memory.homeRoom === roomName && creep.memory.role === role) {
      count += 1;
    }
  }

  return count;
}

export function cleanupMemory(): void {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}
