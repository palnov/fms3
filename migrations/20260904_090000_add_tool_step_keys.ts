import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tools_steps" ADD COLUMN "step_id" varchar;
  UPDATE "tools_steps" SET "step_id" = "id" WHERE "step_id" IS NULL;
  ALTER TABLE "tools_steps" ALTER COLUMN "step_id" SET NOT NULL;
  ALTER TABLE "_tools_v_version_steps" ADD COLUMN "step_id" varchar;
  UPDATE "_tools_v_version_steps" SET "step_id" = "id" WHERE "step_id" IS NULL;
  ALTER TABLE "_tools_v_version_steps" ALTER COLUMN "step_id" SET NOT NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_tools_v_version_steps" DROP COLUMN "step_id";
  ALTER TABLE "tools_steps" DROP COLUMN "step_id";`)
}
