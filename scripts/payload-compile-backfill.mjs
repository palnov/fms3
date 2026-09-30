import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, ".payload-tools");
const outputPath = path.join(outputDirectory, "payload-backfill-legacy-blocks.mjs");
const nextCacheShim = path.join(projectRoot, "scripts", "payload-next-cache-cli-shim.mjs");

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await build({
  alias: { "next/cache": nextCacheShim },
  bundle: true,
  entryPoints: [path.join(projectRoot, "scripts", "payload-backfill-legacy-blocks.mts")],
  format: "esm",
  logLevel: "info",
  outdir: outputDirectory,
  packages: "external",
  platform: "node",
  splitting: true,
  target: "node22",
  chunkNames: "chunks/[name]-[hash]",
  entryNames: "[name]",
  outExtension: { ".js": ".mjs" },
  tsconfig: path.join(projectRoot, "tsconfig.json"),
});

console.log(`Created ${path.relative(projectRoot, outputPath)}`);
