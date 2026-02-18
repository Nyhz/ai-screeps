# Screeps Colony Control Center

Single-file configuration now lives in:

`src/config/settings.ts`

This file is your colony control panel for:

- Role counts per room and per stage
- Progression thresholds (RCL, energy, storage)
- PvP enable/disable
- No-attack room whitelist
- Remote room allow/block filters
- Construction cadence and caps
- Wall/repair targets
- Energy and mineral handling thresholds
- Movement and logistics behavior

---

## Quick Start

1. Edit `src/config/settings.ts`
2. Build:

```bash
npm run build
```

3. Upload:

```bash
npm run push
```

---

## Visual Map of Settings

```text
COLONY_SETTINGS
+- pvp            -> Global combat policy + protected rooms
+- combat         -> Adaptive defense/offense behavior and threat thresholds
+- stage          -> Unlock thresholds for towers/walls/remote/expansion/offense
+- planner        -> Base spawn logic knobs
+- spawn          -> Spawn energy reserve gate
+- upgrading      -> Controller upgrade pause thresholds
+- construction   -> How often and how much to place
+- defense        -> Tower repair limits
+- walls          -> Wall/rampart fortification targets by RCL
+- energy         -> Pickup/withdraw thresholds
+- minerals       -> RCL6+ mineral extraction + hauling + storage
+- movement       -> Pathfinding room span + target range defaults
+- logistics      -> Core delivery behavior near spawn
+- links          -> Link network routing and transfer thresholds
+- telemetry      -> Runtime state/threat logging cadence
+- layout         -> Adaptive room anchor selection for long-term planning
+- expansion      -> Manual room conquest control (default) or auto-neighbor mode
+- roleTargets    -> Global and per-stage hard overrides
+- rooms          -> Per-room overrides (roles, PvP, remote filters)
```

---

## Override Priority (Important)

Role counts are computed in this order:

1. Base planner logic
2. `roleTargets.default`
3. `roleTargets.byStage[stage]`
4. `rooms[roomName].roleTargets`
5. `rooms[roomName].roleTargetsByStage[stage]` (highest priority)

If two settings define the same role, the later item in the list wins.

---

## Full Variable Reference

### `pvp`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `pvp.enabled` | `boolean` | `false` | `true`, `false` | Master switch for offensive behavior. If `false`, offensive targeting is disabled globally. |
| `pvp.noAttackRooms` | `string[]` | `[]` | Any Screeps room names, e.g. `['W8N3']` | Global protected list. Your creeps will not attack these rooms even if PvP is enabled. |

### `combat`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `combat.offenseEnabled` | `boolean` | `false` | `true`, `false` | Enables proactive attacks into non-owned rooms (still subject to PvP rules/whitelist). |
| `combat.defenseEnabled` | `boolean` | `true` | `true`, `false` | Enables reactive defense in owned rooms when hostiles are detected. |
| `combat.defendEvenIfOffenseDisabled` | `boolean` | `true` | `true`, `false` | Allows defenders to engage hostiles even when offense is globally disabled. |
| `combat.threatDecayTicks` | `number` | `30` | `1+` | Keeps recent threat active for N ticks after hostiles disappear (prevents oscillation). |
| `combat.lowThreatScore` | `number` | `20` | `0+` | Threat score threshold for `low`. |
| `combat.mediumThreatScore` | `number` | `60` | `0+` | Threat score threshold for `medium`. |
| `combat.highThreatScore` | `number` | `120` | `0+` | Threat score threshold for `high`. |
| `combat.criticalThreatScore` | `number` | `220` | `0+` | Threat score threshold for `critical`. |
| `combat.emergencySoldiersAtMedium` | `number` | `1` | `0+` | Emergency soldier target when room threat is `medium`. |
| `combat.emergencySoldiersAtHigh` | `number` | `2` | `0+` | Emergency soldier target when room threat is `high`. |
| `combat.emergencySoldiersAtCritical` | `number` | `4` | `0+` | Emergency soldier target when room threat is `critical`. |
| `combat.safeModeThreatLevel` | union | `critical` | `none/low/medium/high/critical` | Minimum threat level required for auto safe mode consideration. |

### `stage`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `stage.towersMinRcl` | `number` | `3` | `1-8` | Minimum RCL required before towers are considered allowed by strategy. |
| `stage.wallsMinRcl` | `number` | `4` | `1-8` | Minimum RCL before wall building/fortification role is enabled. |
| `stage.remoteMiningMinRcl` | `number` | `3` | `1-8` | Minimum RCL for remote mining/scout/reserver behavior. |
| `stage.remoteMiningMinEnergyCapacity` | `number` | `800` | `0+` | Minimum room `energyCapacityAvailable` to unlock remote mining behavior. |
| `stage.expansionMinRcl` | `number` | `4` | `1-8` | Minimum RCL before spawning claimers for expansion (also requires GCL room slot). |
| `stage.offenseMinRcl` | `number` | `6` | `1-8` | Minimum RCL before offensive actions are allowed. |
| `stage.offenseMinStorageEnergy` | `number` | `100000` | `0+` | Storage energy reserve required before offense can activate. |

### `planner`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `planner.minHarvesters` | `number` | `2` | `0+` | Lower bound for harvester count (still compared with source count). |
| `planner.baseHaulers` | `number` | `2` | `0+` | Baseline hauler count before stage-specific adjustments. |
| `planner.haulersPerSource` | `number` | `1` | `0+` | Hauler scaling multiplier per source after bootstrap. Increase if source depots are backing up. |
| `planner.baseUpgraders` | `number` | `1` | `0+` | Baseline upgrader count in bootstrap logic. |
| `planner.buildersWhenSitesExist` | `number` | `2` | `0+` | Builder count when construction sites exist. |
| `planner.buildersWhenNoSites` | `number` | `1` | `0+` | Builder count when no construction sites exist. |
| `planner.heavyBuildSiteThreshold` | `number` | `5` | `0+` | If total sites exceed this, heavy builder count is used. |
| `planner.heavyBuilderCount` | `number` | `3` | `0+` | Builder count used in heavy-build mode. |
| `planner.upgradersByStage.bootstrap` | `number` | `1` | `0+` | Upgrader target in bootstrap stage. |
| `planner.upgradersByStage.early` | `number` | `2` | `0+` | Upgrader target in early stage. |
| `planner.upgradersByStage.mid` | `number` | `3` | `0+` | Upgrader target in mid stage. |
| `planner.upgradersByStage.late` | `number` | `3` | `0+` | Upgrader target in late stage. |
| `planner.repairersWhenEstablished` | `number` | `1` | `0+` | Repairer target after bootstrap stage. |
| `planner.scoutCount` | `number` | `1` | `0+` | Scout target once remote mining capability is unlocked. |
| `planner.reserverCount` | `number` | `1` | `0+` | Reserver target once remote mining is unlocked. |
| `planner.claimerCount` | `number` | `1` | `0+` | Claimer target once expansion is unlocked. |
| `planner.minSoldiers` | `number` | `2` | `0+` | Minimum soldier count once offense is active. |
| `planner.hostilesPerSoldier` | `number` | `2` | `1+` recommended | Soldier scaling factor. `2` means about 1 soldier per 2 observed hostiles. Lower value spawns more soldiers. |

### `construction`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `construction.runInterval` | `number` | `37` | `1+` | Construction manager runs every N ticks. Lower = faster placement, higher CPU usage. |
| `construction.maxRoomConstructionSites` | `number` | `10` | `1+` | If room has more than this many sites, new sites are not placed. |
| `construction.autoPlaceSpawnInClaimedRooms` | `boolean` | `true` | `true`, `false` | If enabled, newly claimed owned rooms automatically place an initial spawn construction site at the planned anchor. |
| `construction.sourceExtensionsPerSource` | `number` | `2` | `0+` | Target count of source-side extension depots per source. |
| `construction.sourceExtensionsMinRcl` | `number` | `2` | `1-8` | Minimum RCL required before source-side extension depots are considered. |
| `construction.requireEnergyCapForSourceExtensions` | `boolean` | `false` | `true`, `false` | If `true`, source-side extension expansion happens only when room energy is capped. |
| `construction.sourceExtensionMaxAvgFillRatioToExpand` | `number` | `0.4` | `0.0-1.0` | Add more source-side extensions only if existing ones are draining fast enough (avg fill ratio below threshold). |

### `spawn`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `spawn.reserveEnergyRatio` | `number` | `0.3` | `0.0-0.95` recommended | Reserves this fraction of total room energy from routine spawning. Example: `0.3` means normal spawns start at ~70% fill. |

### `upgrading`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `upgrading.pauseWhenStorageEnergyBelow` | `number` | `10000` | `0+` | If storage exists and stored energy is below this, controller upgrading is paused and upgrader target becomes `0`. |
| `upgrading.pauseWhenNoStorageFillRatio` | `number` | `0.7` | `0.0-1.0` | Fallback gate before storage exists: upgrading pauses unless room energy fill reaches this ratio. |

### `defense`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `defense.wallRepairCap` | `number` | `200000` | `0+` | Towers will stop repairing walls/ramparts above this hit value. |
| `defense.structureRepairCap` | `number` | `300000` | `0+` | Towers will stop repairing non-wall structures above this hit value (also bounded by hitsMax). |

### `walls`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `walls.targetHitsByRcl` | `Record<number, number>` | per-RCL map | Keys `1..8`, values `0+` | Waller role fortifies walls/ramparts up to this target for each RCL. |

Default map:

```ts
{
  1: 5000,
  2: 20000,
  3: 100000,
  4: 100000,
  5: 200000,
  6: 500000,
  7: 1000000,
  8: 2000000
}
```

### `energy`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `energy.pickupDroppedEnergyMinAmount` | `number` | `50` | `0+` | Minimum dropped energy pile size that creeps will pick up. |
| `energy.haulerContainerWithdrawMinEnergy` | `number` | `100` | `0+` | Minimum container energy before haulers withdraw from source containers. |

### `minerals`

This pipeline supports Oxygen and any other mineral type present in your room.

Activation logic:

- `minerals.enabled = true`
- Room RCL >= `minerals.minRcl` (default `6`)
- Mineral has `mineralAmount > 0`
- If `minerals.requireStorage = true`, room must have `storage`

When active:

- Construction manager places:
  - `STRUCTURE_EXTRACTOR` on mineral
  - A nearby `STRUCTURE_CONTAINER` if missing
  - Roads from spawn anchor to mineral when roads are enabled
- Spawn planner requests:
  - `mineralMiner`
  - `mineralHauler`
- Hauling destination priority:
  1. `storage`
  2. `terminal` if `allowTerminalFallback`
  3. nearest container if `allowContainerFallback`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `minerals.enabled` | `boolean` | `true` | `true`, `false` | Master switch for mineral extraction pipeline. |
| `minerals.minRcl` | `number` | `6` | `1-8` | Minimum room RCL before mineral extraction is allowed. |
| `minerals.requireStorage` | `boolean` | `true` | `true`, `false` | If `true`, mineral roles only activate after storage exists. |
| `minerals.minerCount` | `number` | `1` | `0+` | Desired number of `mineralMiner` creeps when pipeline is active. |
| `minerals.haulerCount` | `number` | `1` | `0+` | Desired number of `mineralHauler` creeps when pipeline is active. |
| `minerals.containerWithdrawMin` | `number` | `50` | `0+` | Minimum non-energy amount in a container before a mineral hauler withdraws. |
| `minerals.allowTerminalFallback` | `boolean` | `true` | `true`, `false` | If `true`, haulers can deliver to terminal when storage is unavailable. |
| `minerals.allowContainerFallback` | `boolean` | `true` | `true`, `false` | If `true`, haulers can fallback to nearest container when no storage or terminal exists. |

### `movement`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `movement.maxRoomsPerPath` | `number` | `16` | `1+` | Max rooms used by `moveTo` pathfinding. Lower values may block remote operations. |
| `movement.defaultRange` | `number` | `1` | `1+` | Default interaction range used by movement helper when no custom range is passed. |

### `logistics`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `logistics.coreDeliveryRangeFromSpawn` | `number` | `8` | `1+` | Haulers prioritize filling extensions within this range from the spawn first, keeping spawn-core energy stable. |

### `links`

Link roles are inferred automatically by position:

- source link: within range 2 of a source
- controller link: within range 2 of controller
- core link: remaining links (usually near anchor/storage)

Routing priority:

1. Source links send to controller link if it needs energy.
2. Otherwise source links send to core links.
3. Core links send to controller link when needed.

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `links.enabled` | `boolean` | `true` | `true`, `false` | Master switch for automated link transfers. |
| `links.minRcl` | `number` | `5` | `1-8` | Minimum RCL before link manager attempts routing. |
| `links.senderMinEnergy` | `number` | `400` | `0+` | Minimum energy a sender link must hold before transfer attempts. |
| `links.receiverMinFreeCapacity` | `number` | `200` | `0+` | Minimum free capacity required for receiver links. |
| `links.controllerLinkTargetLevel` | `number` | `600` | `0-800` | Controller link is treated as needing refill below this energy level. |

### `telemetry`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `telemetry.enabled` | `boolean` | `true` | `true`, `false` | Enables periodic telemetry logs for room state/threat/expansion. |
| `telemetry.interval` | `number` | `50` | `1+` | Prints telemetry every N ticks. |

### `layout`

Adaptive planning picks and caches a room anchor in memory (`Memory.roomPlans`) to keep long-term layout consistent.
If a spawn already exists, spawn position is used as anchor. Otherwise, the planner scores terrain and distances to sources/controller.

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `layout.scanMin` | `number` | `6` | `1-48` | Minimum x/y scan coordinate when searching candidate anchors. |
| `layout.scanMax` | `number` | `43` | `1-48` | Maximum x/y scan coordinate when searching candidate anchors. |
| `layout.minEdgeDistance` | `number` | `4` | `0+` | Penalizes anchors too close to exits/room edges. |
| `layout.desiredControllerRange` | `number` | `8` | `1+` | Target range from anchor to controller during scoring. |
| `layout.desiredSourceRange` | `number` | `8` | `1+` | Target range from anchor to each source during scoring. |

### `expansion`

By default, expansion is manual-only. The bot will not claim new rooms unless you add them to the configured list for a home room.

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `expansion.autoClaimNeighbors` | `boolean` | `false` | `true`, `false` | If `false`, disables automatic neighbor claiming and uses only manual target lists. |
| `expansion.maxConcurrentBootstrapRoomsPerHome` | `number` | `1` | `0+` | Max number of already-claimed rooms each home room bootstraps in parallel before they have their own spawn. |
| `expansion.bootstrapperCountPerTargetRoom` | `number` | `2` | `0+` | Number of dedicated `bootstrapper` creeps spawned per bootstrapped target room. |
| `expansion.manualClaimTargetsByRoom` | `Record<string, string[]>` | `{}` | Map of `homeRoom -> [targetRoom,...]` | Manual conquest queue. Add a target room name to start claiming it. |

Manual conquest behavior:

1. Bot picks only one pending target at a time per home room (first unresolved in your list).
2. It keeps trying that same room until owned.
3. Once owned, it is automatically considered complete and no longer targeted.
4. After claim, parent room sends `bootstrapper` creeps to build startup structures until the new room has its own spawn.
5. No repeated re-conquer loop happens while the room stays yours.

### `roleTargets`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `roleTargets.default` | `Partial<Record<RoleName, number>>` | `{}` | Role keys with counts | Global hard override for desired role counts in all rooms/stages. |
| `roleTargets.byStage.bootstrap` | same | `{}` | Role keys with counts | Hard override for bootstrap stage only. |
| `roleTargets.byStage.early` | same | `{}` | Role keys with counts | Hard override for early stage only. |
| `roleTargets.byStage.mid` | same | `{}` | Role keys with counts | Hard override for mid stage only. |
| `roleTargets.byStage.late` | same | `{}` | Role keys with counts | Hard override for late stage only. |

Valid role keys:

`harvester`, `hauler`, `miner`, `mineralMiner`, `mineralHauler`, `upgrader`, `builder`, `repairer`, `waller`, `scout`, `reserver`, `claimer`, `bootstrapper`, `soldier`

### `rooms`

Per-room local policy and overrides.

```ts
rooms: {
  W1N1: {
    roleTargets: { upgrader: 4, builder: 2, mineralHauler: 1 },
    roleTargetsByStage: {
      mid: { reserver: 2 }
    },
    disablePvP: true,
    noAttackRooms: ["W1N2", "W2N1"],
    remoteRoomAllowlist: ["W1N2", "W1N0"],
    remoteRoomBlocklist: ["W0N1"]
  }
}
```

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `rooms[roomName].roleTargets` | `Partial<Record<RoleName, number>>` | `{}` | Role keys with counts | Per-room hard override, higher priority than global/stage overrides. |
| `rooms[roomName].roleTargetsByStage` | `Partial<Record<ColonyStage, Partial<Record<RoleName, number>>>>` | `{}` | Stage + role maps | Highest-priority role override for a room at a specific stage. |
| `rooms[roomName].disablePvP` | `boolean` | `false` | `true`, `false` | Disables offense for this room only (even if global PvP is enabled). |
| `rooms[roomName].noAttackRooms` | `string[]` | `[]` | Room names | Extra per-room protected rooms merged with global `pvp.noAttackRooms`. |
| `rooms[roomName].remoteRoomAllowlist` | `string[] \| undefined` | `undefined` | Room names | If set and non-empty, only these rooms are valid for this room's remote reserve/claim targeting. |
| `rooms[roomName].remoteRoomBlocklist` | `string[]` | `[]` | Room names | Rooms excluded from this room's remote reserve/claim targeting. |

---

## RCL3+ Source Depot Energy Flow

At higher extension counts, the bot can create source-side extension depots and route energy toward spawn-core.

Flow:

1. `miner` harvests source energy.
2. Miner deposits first into extension depots near the source.
3. `hauler` withdraws from source-side extensions/containers.
4. Hauler fills spawn-core extensions first, then other priority energy targets.
5. In newly conquered rooms, first spawn site is placed at the adaptive planned anchor so future extensions/roads/defenses fit the same blueprint.

Recommended starting values:

```ts
planner: {
  ...COLONY_SETTINGS.planner,
  haulersPerSource: 1
},
construction: {
  ...COLONY_SETTINGS.construction,
  sourceExtensionsPerSource: 2,
  sourceExtensionsMinRcl: 2,
  requireEnergyCapForSourceExtensions: false,
  sourceExtensionMaxAvgFillRatioToExpand: 0.4
},
logistics: {
  coreDeliveryRangeFromSpawn: 8
}
```

---

## RCL6+ Mineral Pipeline Example

```ts
minerals: {
  enabled: true,
  minRcl: 6,
  requireStorage: true,
  minerCount: 1,
  haulerCount: 1,
  containerWithdrawMin: 50,
  allowTerminalFallback: true,
  allowContainerFallback: true
}
```

Effect:

- As soon as a room reaches RCL6 and has storage, extractor/container/road infra gets planned.
- One miner starts harvesting mineral directly from the deposit.
- One hauler moves mineral into storage for later labs/industry usage.

---

## Guardrails and Gotchas

- Keep `planner.hostilesPerSoldier >= 1` to avoid extreme soldier scaling.
- Very low `construction.runInterval` can increase CPU usage significantly.
- If `construction.sourceExtensionMaxAvgFillRatioToExpand` is too high, source depots may overbuild and stay full.
- If `planner.haulersPerSource` is too low, source-side extensions/containers can saturate and throttle miners.
- Very low `movement.maxRoomsPerPath` can break remote operations.
- High wall targets at low RCL can stall controller upgrades.
- Setting `minerals.requireStorage = false` can start extraction earlier, but stockpiling may become inefficient.
- `remoteRoomAllowlist` takes precedence in practice: if set, only listed rooms are allowed.
- `rooms[roomName].disablePvP = true` overrides global PvP for that room.

---

## Build and Deploy

```bash
npm run build
npm run push
```
