import path from "node:path";
import { pathToFileURL } from "node:url";

const PRODUCTION_DATABASE_NAME = "fms3";
const TARGET_MIGRATION_NAME = "20260930_135327_20260930_add_page_hierarchy";

type RunMode = "dry-run" | "apply";

function parseArguments(args: string[]) {
  const help = args.includes("--help") || args.includes("-h");
  if (help) {
    if (args.length !== 1) throw new Error("--help cannot be combined with other options.");
    return { help: true, mode: undefined, targetDatabase: undefined, allowProduction: false };
  }

  const modes = args.filter((argument) => argument === "--dry-run" || argument === "--apply");
  if (modes.length !== 1) throw new Error("Choose exactly one mode: --dry-run or --apply.");
  const targetArgument = args.find((argument) => argument.startsWith("--target-db="));
  const targetDatabase = targetArgument?.slice("--target-db=".length);
  const allowProduction = args.includes("--allow-production");
  const unknownArguments = args.filter((argument) =>
    argument !== modes[0]
    && argument !== "--allow-production"
    && !argument.startsWith("--target-db="),
  );

  if (unknownArguments.length > 0) throw new Error(`Unknown options: ${unknownArguments.join(", ")}`);
  if (targetDatabase !== PRODUCTION_DATABASE_NAME || !allowProduction) {
    throw new Error(`Production migrations require --target-db=${PRODUCTION_DATABASE_NAME} --allow-production.`);
  }

  return { help: false, mode: modes[0].slice(2) as RunMode, targetDatabase, allowProduction };
}

function assertProductionDatabase(databaseUrl: string, targetDatabase: string | undefined) {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  const database = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (database !== targetDatabase || database !== PRODUCTION_DATABASE_NAME) {
    throw new Error("DATABASE_URL database does not match the exact production target.");
  }
}

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[DATABASE_URL]").slice(0, 300);
}

async function main() {
  const { help, mode, targetDatabase } = parseArguments(process.argv.slice(2));
  if (help) {
    console.log("Usage: node payload-run-schema-migrations.mjs (--dry-run | --apply) --target-db=fms3 --allow-production");
    return;
  }
  if (process.env.NODE_ENV !== "production") throw new Error("Schema migrations are allowed only in NODE_ENV=production.");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");
  assertProductionDatabase(databaseUrl, targetDatabase);

  process.env.PAYLOAD_DB_PUSH = "false";
  process.env.PAYLOAD_MIGRATING = "true";
  process.env.PAYLOAD_PROJECT_ROOT ||= process.cwd();

  const { getPayload } = await import("payload");
  const { default: configPromise } = await import("../src/payload.config.mjs");
  const payload = await getPayload({ config: configPromise });

  try {
    const migrationDirectory = path.join(process.cwd(), "scripts", "payload-tools", "migrations");
    const { readdir } = await import("node:fs/promises");
    const migrationNames = (await readdir(migrationDirectory))
      .filter((file) => file.endsWith(".js"))
      .map((file) => path.basename(file, ".js"))
      .sort();
    if (!migrationNames.includes(TARGET_MIGRATION_NAME)) {
      throw new Error(`The expected migration bundle ${TARGET_MIGRATION_NAME} is missing.`);
    }

    const migrationsResult = await payload.find({
      collection: "payload-migrations" as never,
      depth: 0,
      limit: 0,
      overrideAccess: true,
      sort: "-batch",
      where: { batch: { not_equals: -1 } },
    });
    const appliedMigrations = new Map(
      (migrationsResult.docs as unknown as Array<{ name?: unknown; batch?: unknown }>)
        .filter((migration) => typeof migration.name === "string")
        .map((migration) => [migration.name as string, migration.batch]),
    );
    console.log(`${mode === "dry-run" ? "DRY RUN" : "APPLY"} target=${targetDatabase} schema_push=${process.env.PAYLOAD_DB_PUSH}`);
    console.log(`MIGRATION ${TARGET_MIGRATION_NAME} status=${appliedMigrations.has(TARGET_MIGRATION_NAME) ? "already-applied" : "pending"} compiled_migrations=${migrationNames.length}`);
    for (const name of migrationNames) {
      if (!appliedMigrations.has(name)) console.log(`PENDING ${name}`);
    }
    if (mode === "dry-run" || appliedMigrations.has(TARGET_MIGRATION_NAME)) return;

    const migrationPath = path.join(migrationDirectory, `${TARGET_MIGRATION_NAME}.js`);
    const migrationModule = await import(pathToFileURL(migrationPath).href);
    const migration = "default" in migrationModule ? migrationModule.default : migrationModule;
    if (typeof migration.up !== "function" || typeof migration.down !== "function") {
      throw new Error(`The migration bundle ${TARGET_MIGRATION_NAME} does not export up/down functions.`);
    }

    await payload.db.migrate({ migrations: [{ name: TARGET_MIGRATION_NAME, up: migration.up, down: migration.down }] });
    console.log(`APPLIED ${TARGET_MIGRATION_NAME}`);
  } finally {
    await payload.destroy();
  }
}

main().catch((error) => {
  console.error(`Payload schema migration failed: ${safeErrorMessage(error)}`);
  process.exitCode = 1;
}).finally(() => {
  const exitCode = process.exitCode ?? 0;
  process.stdout.write("", () => {
    process.stderr.write("", () => process.exit(exitCode));
  });
});
