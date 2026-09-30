import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [entryPoint, ...args] = process.argv.slice(2);

if (!entryPoint) {
  console.error("Usage: node scripts/payload-esm-runner.mjs <entrypoint.mts> [...args]");
  process.exit(2);
}

const outputPath = path.join(projectRoot, "scripts", `.payload-runner-${process.pid}-${Date.now()}.mjs`);
const environmentShim = path.join(projectRoot, "scripts", "payload-env-shim.cjs");
const nextCacheShim = path.join(projectRoot, "scripts", "payload-next-cache-cli-shim.mjs");

try {
  await build({
    alias: { "next/cache": nextCacheShim },
    bundle: true,
    entryPoints: [path.resolve(projectRoot, entryPoint)],
    format: "esm",
    logLevel: "silent",
    outfile: outputPath,
    packages: "external",
    platform: "node",
    target: `node${process.versions.node.split(".")[0]}`,
    tsconfig: path.join(projectRoot, "tsconfig.json"),
  });

  const result = spawnSync(process.execPath, ["--require", environmentShim, outputPath, ...args], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await rm(outputPath, { force: true });
}
