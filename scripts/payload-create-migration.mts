import { getPayload } from "payload";

const migrationName = process.argv[2] || "payload_schema";
process.env.PAYLOAD_DB_PUSH = "false";
const { default: configPromise } = await import("../src/payload.config.mjs");
const payload = await getPayload({
  config: configPromise,
  disableDBConnect: true,
  disableOnInit: true,
  key: "payload-migration-create",
});

try {
  await payload.db.createMigration({ migrationName, payload, skipEmpty: true });
} finally {
  await payload.destroy();
}
