# Screeps TypeScript Colony Starter

TypeScript Screeps starter with:

- Typed game API via `@types/screeps`
- Bundling via `esbuild`
- Upload script via `screeps-api`
- Basic autonomous colony loop (harvest, spawn, build, upgrade, defend)

## 1) Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env
```

3. Fill `.env`:

- `SCREEPS_TOKEN`: your Screeps auth token
- `SCREEPS_BRANCH`: target branch (`default`, `season`, etc.)
- `SCREEPS_HOST`: use `https://screeps.com` (official server) or your private server host

## 2) Build and Upload

Build only:

```bash
npm run build
```

Build and upload to configured branch:

```bash
npm run push
```

Build and upload to simulator branch (`sim`):

```bash
npm run push:sim
```

Build and upload to PTR:

```bash
npm run push:ptr
```

## 3) Token

Get your Screeps token from:

- Screeps web client -> Account settings -> Auth token

Then place it in `.env` as `SCREEPS_TOKEN`.

## 4) Project Layout

- `src/main.ts`: game loop entrypoint
- `src/roles/*`: creep role logic
- `src/spawnManager.ts`: spawn priorities
- `src/roomManager.ts`: early automation (extensions/roads/containers/tower sites)
- `src/towerManager.ts`: defense and repairs
- `scripts/upload.js`: upload to Screeps API

## 5) Notes

- This starter is intentionally simple and stable for early progression.
- Next step after bootstrapping is adding remote mining, hauling, and room planning.
