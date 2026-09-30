import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, ".payload-tools");
const nextCacheShim = path.join(projectRoot, "scripts", "payload-next-cache-cli-shim.mjs");
const cliEntries = {
  "payload-backfill-legacy-blocks": path.join(projectRoot, "scripts", "payload-backfill-legacy-blocks.mts"),
  "payload-backfill-page-hierarchy": path.join(projectRoot, "scripts", "payload-backfill-page-hierarchy.mts"),
  "payload-run-schema-migrations": path.join(projectRoot, "scripts", "payload-run-schema-migrations.mts"),
};
const externalPackages = [
  "@payloadcms/db-postgres",
  "@payloadcms/email-nodemailer",
  "@payloadcms/richtext-lexical",
  "payload",
  "react",
  "react-dom",
  "server-only",
  "sharp",
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await build({
  alias: { "next/cache": nextCacheShim },
  bundle: true,
  entryPoints: cliEntries,
  external: externalPackages,
  format: "esm",
  logLevel: "info",
  outdir: outputDirectory,
  platform: "node",
  splitting: true,
  target: "node22",
  chunkNames: "chunks/[name]-[hash]",
  outExtension: { ".js": ".mjs" },
  tsconfig: path.join(projectRoot, "tsconfig.json"),
});

const migrationSourceDirectory = path.join(projectRoot, "migrations");
const migrationFiles = (await readdir(migrationSourceDirectory))
  .filter((file) => file.endsWith(".ts") && file !== "index.ts")
  .sort();
if (migrationFiles.length === 0) throw new Error("No Payload migration files were found.");

await build({
  bundle: true,
  entryPoints: migrationFiles.map((file) => path.join(migrationSourceDirectory, file)),
  external: ["@payloadcms/db-postgres", "payload"],
  format: "cjs",
  logLevel: "info",
  outdir: path.join(outputDirectory, "migrations"),
  platform: "node",
  target: "node22",
  tsconfig: path.join(projectRoot, "tsconfig.json"),
});

console.log(`Created Payload maintenance tools and ${migrationFiles.length} executable migration bundles.`);
