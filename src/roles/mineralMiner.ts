import { harvestMineral, roomMineral, roomMineralContainer, transferCarriedMinerals } from "../tasks/minerals";

export function runMineralMiner(creep: Creep): void {
  const mineral = roomMineral(creep.room);
  if (!mineral || mineral.mineralAmount <= 0) return;

  const container = roomMineralContainer(creep.room);
  if (container && creep.pos.getRangeTo(container) > 0) {
    creep.moveTo(container, { reusePath: 20, visualizePathStyle: { stroke: "#c77dff" } });
    return;
  }

  if (creep.store.getFreeCapacity() === 0) {
    if (container) {
      const resource = (Object.keys(creep.store) as ResourceConstant[]).find(
        (entry) => entry !== RESOURCE_ENERGY && creep.store.getUsedCapacity(entry) > 0
      );
      if (!resource) return;

      const result = creep.transfer(container, resource);
      if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { reusePath: 10, visualizePathStyle: { stroke: "#c77dff" } });
      }
      return;
    }

    transferCarriedMinerals(creep);
    return;
  }

  harvestMineral(creep);
}
