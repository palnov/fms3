import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "home_content" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_content" jsonb;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "home_content";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_content";`)
}
