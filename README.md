# Screeps Colony Control Center

Single-file configuration now lives in:

`src/config/settings.ts`

This file is your colony "control panel" for:

- Role counts per room and per stage
- Progression thresholds (RCL, energy, storage)
- PvP enable/disable
- No-attack room whitelist
- Remote room allow/block filters
- Construction cadence and caps
- Wall/repair targets
- Movement pathing limits

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
├─ pvp            -> Global combat policy + protected rooms
├─ stage          -> Unlock thresholds for towers/walls/remote/expansion/offense
├─ planner        -> Base spawn logic knobs
├─ construction   -> How often and how much to place
├─ defense        -> Tower repair limits
├─ walls          -> Wall/rampart fortification targets by RCL
├─ energy         -> Pickup/withdraw thresholds
├─ movement       -> Pathfinding room span + target range defaults
├─ roleTargets    -> Global and per-stage hard overrides
└─ rooms          -> Per-room overrides (roles, PvP, remote filters)
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
| `pvp.noAttackRooms` | `string[]` | `[]` | Any Screeps room names, e.g. `["W8N3"]` | Global protected list. Your creeps will not attack these rooms even if PvP is enabled. |

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
| `planner.baseHaulers` | `number` | `1` | `0+` | Baseline hauler count before stage-specific adjustments. |
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

### `movement`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `movement.maxRoomsPerPath` | `number` | `16` | `1+` | Max rooms used by `moveTo` pathfinding. Lower values may block remote operations. |
| `movement.defaultRange` | `number` | `1` | `1+` | Default interaction range used by movement helper when no custom range is passed. |

### `roleTargets`

| Variable | Type | Default | Possible values | Effect |
|---|---|---:|---|---|
| `roleTargets.default` | `Partial<Record<RoleName, number>>` | `{}` | Role keys with counts | Global hard override for desired role counts in all rooms/stages. |
| `roleTargets.byStage.bootstrap` | same | `{}` | Role keys with counts | Hard override for bootstrap stage only. |
| `roleTargets.byStage.early` | same | `{}` | Role keys with counts | Hard override for early stage only. |
| `roleTargets.byStage.mid` | same | `{}` | Role keys with counts | Hard override for mid stage only. |
| `roleTargets.byStage.late` | same | `{}` | Role keys with counts | Hard override for late stage only. |

Valid role keys:

`harvester`, `hauler`, `miner`, `upgrader`, `builder`, `repairer`, `waller`, `scout`, `reserver`, `claimer`, `soldier`

### `rooms`

Per-room local policy and overrides.

```ts
rooms: {
  W1N1: {
    roleTargets: { upgrader: 4, builder: 2 },
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
| `rooms[roomName].noAttackRooms` | `string[]` | `[]` | Room names | Extra per-room protected rooms; merged with global `pvp.noAttackRooms`. |
| `rooms[roomName].remoteRoomAllowlist` | `string[] \| undefined` | `undefined` | Room names | If set and non-empty, only these rooms are valid for this room's remote reserve/claim targeting. |
| `rooms[roomName].remoteRoomBlocklist` | `string[]` | `[]` | Room names | Rooms excluded from this room's remote reserve/claim targeting. |

---

## Recommended Presets

### Safe Economy (no PvP)

```ts
pvp: { enabled: false, noAttackRooms: [] },
stage: {
  towersMinRcl: 3,
  wallsMinRcl: 4,
  remoteMiningMinRcl: 3,
  remoteMiningMinEnergyCapacity: 800,
  expansionMinRcl: 4,
  offenseMinRcl: 8,
  offenseMinStorageEnergy: 500000
}
```

Effect:

- Strong focus on growth and defense
- No accidental aggression
- Expansion starts at RCL4 if GCL allows

### Expansion First

```ts
planner: {
  ...COLONY_SETTINGS.planner,
  upgradersByStage: { bootstrap: 1, early: 1, mid: 2, late: 2 },
  claimerCount: 2,
  reserverCount: 2
}
```

Effect:

- Fewer upgraders, more room-control units
- Faster claim/reserve pressure

### Fortress Mode

```ts
walls: {
  targetHitsByRcl: {
    1: 5000, 2: 50000, 3: 200000, 4: 300000,
    5: 500000, 6: 1000000, 7: 3000000, 8: 10000000
  }
},
defense: { wallRepairCap: 500000, structureRepairCap: 500000 }
```

Effect:

- Higher energy spent on survivability
- Slower tech progression if economy is not strong

---

## Guardrails and Gotchas

- Keep `planner.hostilesPerSoldier >= 1` to avoid extreme soldier scaling.
- Very low `construction.runInterval` can increase CPU usage significantly.
- Very low `movement.maxRoomsPerPath` can break remote operations.
- High wall targets at low RCL can stall controller upgrades.
- `remoteRoomAllowlist` takes precedence in practice: if set, only listed rooms are allowed.
- `rooms[roomName].disablePvP = true` overrides global PvP for that room.

---

## Build and Deploy

```bash
npm run build
npm run push
```
