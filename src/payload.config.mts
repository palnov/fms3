import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { BlocksFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { DataTables, Media, Pages, RuleTestCases, Tools, Users } from "@/payload/collections";
import { pageContentBlocks } from "@/payload/blocks";
import { SiteSettings } from "@/payload/globals";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const payloadSecret = process.env.PAYLOAD_SECRET?.trim();
const pushSchema = process.env.NODE_ENV !== "production" && process.env.PAYLOAD_DB_PUSH !== "false";
const smtpHost = process.env.SMTP_HOST?.trim();
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpFromAddress = process.env.SMTP_FROM_ADDRESS?.trim();
const smtpFromName = process.env.SMTP_FROM_NAME?.trim() || "Миграционный справочник";
const smtpPortValue = process.env.SMTP_PORT?.trim();
const smtpSecureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
const hasSmtpSettings = Boolean(
  smtpHost || smtpUser || smtpPassword || smtpFromAddress,
);

function createEmailAdapter() {
  if (!hasSmtpSettings) return undefined;

  const missingSmtpSettings = [
    ["SMTP_HOST", smtpHost],
    ["SMTP_USER", smtpUser],
    ["SMTP_PASSWORD", smtpPassword],
    ["SMTP_FROM_ADDRESS", smtpFromAddress],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingSmtpSettings.length > 0) {
    throw new Error(`Incomplete SMTP configuration. Set: ${missingSmtpSettings.join(", ")}.`);
  }

  const smtpPort = smtpPortValue ? Number(smtpPortValue) : 587;
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    throw new Error("SMTP_PORT must be a valid port number between 1 and 65535.");
  }

  const host = smtpHost || "";
  const user = smtpUser || "";
  const password = smtpPassword || "";
  const fromAddress = smtpFromAddress || "";

  return nodemailerAdapter({
    defaultFromAddress: fromAddress,
    defaultFromName: smtpFromName,
    transportOptions: {
      host,
      port: smtpPort,
      secure: smtpSecureValue ? smtpSecureValue === "true" : smtpPort === 465,
      auth: { user, pass: password },
    },
  });
}
const emailAdapter = createEmailAdapter();

if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL && (!payloadSecret || payloadSecret.length < 32)) {
  throw new Error("PAYLOAD_SECRET must contain at least 32 characters in production.");
}

export default buildConfig({
  ...(emailAdapter ? { email: emailAdapter } : {}),
  admin: {
    user: "users",
    meta: {
      titleSuffix: " | Миграционный справочник",
      icons: { icon: "/favicon.ico" },
    },
    dateFormat: "dd.MM.yyyy",
    theme: "all",
  },
  collections: [Users, Media, Pages, Tools, DataTables, RuleTestCases],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({ blocks: pageContentBlocks }),
    ],
  }),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/fms3" },
    push: pushSchema,
    migrationDir: path.resolve(dirname, "../migrations"),
  }),
  globals: [SiteSettings],
  graphQL: { disable: true },
  routes: {
    admin: "/cms",
    api: "/api/cms",
    graphQL: "/api/cms/graphql",
    graphQLPlayground: "/api/cms/graphql-playground",
  },
  secret: payloadSecret || "local-development-payload-secret-change-me",
  serverURL: siteUrl,
  csrf: [siteUrl],
  telemetry: false,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  sharp,
});
