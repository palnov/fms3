/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");

for (const [source, target] of [
  [path.join(projectRoot, ".next", "static"), path.join(standaloneRoot, ".next", "static")],
  [path.join(projectRoot, "public"), path.join(standaloneRoot, "public")],
]) {
  if (!fs.existsSync(source)) continue;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true, force: true });
}

const child = spawn(process.execPath, [path.join(standaloneRoot, "server.js")], {
  cwd: standaloneRoot,
  env: process.env,
  stdio: "inherit",
});

const forwardSignal = (signal) => {
  if (child.exitCode === null) child.kill(signal);
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));
process.on("SIGBREAK", () => forwardSignal("SIGBREAK"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
