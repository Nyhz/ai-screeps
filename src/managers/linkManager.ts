import { COLONY_SETTINGS } from "../config/settings";
import { getRoomAnchor } from "../colony/layoutPlanner";

function myLinks(room: Room): StructureLink[] {
  return room.find(FIND_MY_STRUCTURES, {
    filter: (structure: Structure) => structure.structureType === STRUCTURE_LINK
  }) as StructureLink[];
}

function controllerLinks(room: Room, links: StructureLink[]): StructureLink[] {
  const controller = room.controller;
  if (!controller) return [];
  return links.filter((link) => link.pos.getRangeTo(controller) <= 2);
}

function sourceLinks(room: Room, links: StructureLink[]): StructureLink[] {
  const sources = room.find(FIND_SOURCES);
  return links.filter((link) => sources.some((source) => link.pos.getRangeTo(source) <= 2));
}

function coreLinks(room: Room, links: StructureLink[], controller: StructureLink[], source: StructureLink[]): StructureLink[] {
  const excluded = new Set([...controller.map((link) => link.id), ...source.map((link) => link.id)]);
  const roomAnchor = getRoomAnchor(room);

  const remaining = links.filter((link) => !excluded.has(link.id));
  if (!roomAnchor) return remaining;

  return remaining.sort((a, b) => a.pos.getRangeTo(roomAnchor) - b.pos.getRangeTo(roomAnchor));
}

function canSend(link: StructureLink): boolean {
  if (link.cooldown > 0) return false;
  return link.store.getUsedCapacity(RESOURCE_ENERGY) >= COLONY_SETTINGS.links.senderMinEnergy;
}

function pickReceiver(receivers: StructureLink[]): StructureLink | null {
  const viable = receivers.filter(
    (link) => link.store.getFreeCapacity(RESOURCE_ENERGY) >= COLONY_SETTINGS.links.receiverMinFreeCapacity
  );
  if (viable.length === 0) return null;
  viable.sort(
    (a, b) => b.store.getFreeCapacity(RESOURCE_ENERGY) - a.store.getFreeCapacity(RESOURCE_ENERGY)
  );
  return viable[0];
}

function runRoomLinks(room: Room): void {
  const rcl = room.controller?.level ?? 0;
  if (rcl < COLONY_SETTINGS.links.minRcl) return;

  const links = myLinks(room);
  if (links.length < 2) return;

  const controller = controllerLinks(room, links);
  const source = sourceLinks(room, links);
  const core = coreLinks(room, links, controller, source);

  const controllerNeedsEnergy = controller.filter(
    (link) => link.store.getUsedCapacity(RESOURCE_ENERGY) < COLONY_SETTINGS.links.controllerLinkTargetLevel
  );

  for (const sender of source) {
    if (!canSend(sender)) continue;

    const preferred = pickReceiver(controllerNeedsEnergy) ?? pickReceiver(core);
    if (!preferred) continue;

    sender.transferEnergy(preferred);
  }

  for (const sender of core) {
    if (!canSend(sender)) continue;

    const receiver = pickReceiver(controllerNeedsEnergy);
    if (!receiver) continue;

    sender.transferEnergy(receiver);
  }
}

export function runLinkManager(): void {
  if (!COLONY_SETTINGS.links.enabled) return;
  for (const room of Object.values(Game.rooms)) {
    if (!room.controller?.my) continue;
    runRoomLinks(room);
  }
}
