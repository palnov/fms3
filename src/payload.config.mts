import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
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

if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL && (!payloadSecret || payloadSecret.length < 32)) {
  throw new Error("PAYLOAD_SECRET must contain at least 32 characters in production.");
}

export default buildConfig({
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
