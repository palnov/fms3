/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const tsxCli = path.resolve(__dirname, "..", "node_modules", "tsx", "dist", "cli.mjs");
const shim = path.resolve(__dirname, "payload-env-shim.cjs").replaceAll("\\", "/");
const nodeOptions = [process.env.NODE_OPTIONS, `--require=${shim}`].filter(Boolean).join(" ");

const result = spawnSync(process.execPath, [tsxCli, ...process.argv.slice(2)], {
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
