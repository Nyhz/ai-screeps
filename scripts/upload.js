"use strict";

const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");
const { ScreepsAPI } = require("screeps-api");

dotenv.config();

const argv = process.argv.slice(2);
const isSim = argv.includes("--sim");
const isPtr = argv.includes("--ptr");

const DIST_FILE = path.resolve(__dirname, "..", "dist", "main.js");
if (!fs.existsSync(DIST_FILE)) {
  throw new Error("dist/main.js not found. Run `npm run build` first.");
}

const token = process.env.SCREEPS_TOKEN;
if (!token) {
  throw new Error("Missing SCREEPS_TOKEN in .env");
}

const host = process.env.SCREEPS_HOST || "https://screeps.com";
const branch = isSim ? "sim" : process.env.SCREEPS_BRANCH || "default";

async function push() {
  const api = await ScreepsAPI.fromToken(token, host, isPtr);
  const code = fs.readFileSync(DIST_FILE, "utf8");

  const result = await api.code.set(branch, {
    main: code
  });

  if (!result.ok) {
    throw new Error(`Upload failed: ${JSON.stringify(result)}`);
  }

  process.stdout.write(`Uploaded dist/main.js to ${host} branch '${branch}'${isPtr ? " (PTR)" : ""}.\n`);
}

push().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
