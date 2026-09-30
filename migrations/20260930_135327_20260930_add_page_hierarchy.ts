import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_blocks_related_guide" ADD COLUMN "page_id" integer;
  ALTER TABLE "pages_blocks_related_guide" ADD COLUMN "external_href" varchar;
  ALTER TABLE "pages_blocks_link_card_grid_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "pages_blocks_link_card_grid_items" ADD COLUMN "external_href" varchar;
  ALTER TABLE "pages" ADD COLUMN "parent_id" integer;
  ALTER TABLE "pages" ADD COLUMN "tree_order" numeric DEFAULT 0;
  ALTER TABLE "_pages_v_blocks_related_guide" ADD COLUMN "page_id" integer;
  ALTER TABLE "_pages_v_blocks_related_guide" ADD COLUMN "external_href" varchar;
  ALTER TABLE "_pages_v_blocks_link_card_grid_items" ADD COLUMN "page_id" integer;
  ALTER TABLE "_pages_v_blocks_link_card_grid_items" ADD COLUMN "external_href" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_parent_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_tree_order" numeric DEFAULT 0;
  ALTER TABLE "pages_blocks_related_guide" ADD CONSTRAINT "pages_blocks_related_guide_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_card_grid_items" ADD CONSTRAINT "pages_blocks_link_card_grid_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_related_guide" ADD CONSTRAINT "_pages_v_blocks_related_guide_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_card_grid_items" ADD CONSTRAINT "_pages_v_blocks_link_card_grid_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_related_guide_page_idx" ON "pages_blocks_related_guide" USING btree ("page_id");
  CREATE INDEX "pages_blocks_link_card_grid_items_page_idx" ON "pages_blocks_link_card_grid_items" USING btree ("page_id");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_related_guide_page_idx" ON "_pages_v_blocks_related_guide" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_link_card_grid_items_page_idx" ON "_pages_v_blocks_link_card_grid_items" USING btree ("page_id");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_related_guide" DROP CONSTRAINT "pages_blocks_related_guide_page_id_pages_id_fk";

  ALTER TABLE "pages_blocks_link_card_grid_items" DROP CONSTRAINT "pages_blocks_link_card_grid_items_page_id_pages_id_fk";

  ALTER TABLE "pages" DROP CONSTRAINT "pages_parent_id_pages_id_fk";

  ALTER TABLE "_pages_v_blocks_related_guide" DROP CONSTRAINT "_pages_v_blocks_related_guide_page_id_pages_id_fk";

  ALTER TABLE "_pages_v_blocks_link_card_grid_items" DROP CONSTRAINT "_pages_v_blocks_link_card_grid_items_page_id_pages_id_fk";

  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_parent_id_pages_id_fk";

  DROP INDEX "pages_blocks_related_guide_page_idx";
  DROP INDEX "pages_blocks_link_card_grid_items_page_idx";
  DROP INDEX "pages_parent_idx";
  DROP INDEX "_pages_v_blocks_related_guide_page_idx";
  DROP INDEX "_pages_v_blocks_link_card_grid_items_page_idx";
  DROP INDEX "_pages_v_version_version_parent_idx";
  ALTER TABLE "pages_blocks_related_guide" DROP COLUMN "page_id";
  ALTER TABLE "pages_blocks_related_guide" DROP COLUMN "external_href";
  ALTER TABLE "pages_blocks_link_card_grid_items" DROP COLUMN "page_id";
  ALTER TABLE "pages_blocks_link_card_grid_items" DROP COLUMN "external_href";
  ALTER TABLE "pages" DROP COLUMN "parent_id";
  ALTER TABLE "pages" DROP COLUMN "tree_order";
  ALTER TABLE "_pages_v_blocks_related_guide" DROP COLUMN "page_id";
  ALTER TABLE "_pages_v_blocks_related_guide" DROP COLUMN "external_href";
  ALTER TABLE "_pages_v_blocks_link_card_grid_items" DROP COLUMN "page_id";
  ALTER TABLE "_pages_v_blocks_link_card_grid_items" DROP COLUMN "external_href";
  ALTER TABLE "_pages_v" DROP COLUMN "version_parent_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_tree_order";`)
}
