import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'publisher');
  CREATE TYPE "public"."enum_pages_kind" AS ENUM('article', 'landing', 'legal', 'policy');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_kind" AS ENUM('article', 'landing', 'legal', 'policy');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tools_fields_type" AS ENUM('text', 'textarea', 'number', 'currency', 'date', 'dateRange', 'select', 'radio', 'checkbox', 'multiSelect');
  CREATE TYPE "public"."enum_tools_formulas_operands_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum_tools_formulas_kind" AS ENUM('add', 'subtract', 'multiply', 'divide', 'percent', 'round', 'min', 'max', 'dateDiffDays', 'dateAddDays', 'lookup', 'conditional', 'normalizeNumber');
  CREATE TYPE "public"."enum_tools_formulas_left_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum_tools_formulas_right_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum_tools_formulas_days_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum_tools_formulas_then_value_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum_tools_formulas_else_value_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum_tools_formulas_lookup_value_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum_tools_steps_type" AS ENUM('question', 'info', 'branch', 'calculation', 'checklist', 'result', 'cta');
  CREATE TYPE "public"."enum_tools_results_status" AS ENUM('success', 'warning', 'error', 'info');
  CREATE TYPE "public"."enum_tools_tool_type" AS ENUM('calculator', 'scenario', 'checklist', 'checker', 'ai');
  CREATE TYPE "public"."enum_tools_execution_mode" AS ENUM('runtime', 'provider');
  CREATE TYPE "public"."enum_tools_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tools_v_version_fields_type" AS ENUM('text', 'textarea', 'number', 'currency', 'date', 'dateRange', 'select', 'radio', 'checkbox', 'multiSelect');
  CREATE TYPE "public"."enum__tools_v_version_formulas_operands_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum__tools_v_version_formulas_kind" AS ENUM('add', 'subtract', 'multiply', 'divide', 'percent', 'round', 'min', 'max', 'dateDiffDays', 'dateAddDays', 'lookup', 'conditional', 'normalizeNumber');
  CREATE TYPE "public"."enum__tools_v_version_formulas_left_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum__tools_v_version_formulas_right_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum__tools_v_version_formulas_days_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum__tools_v_version_formulas_then_value_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum__tools_v_version_formulas_else_value_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum__tools_v_version_formulas_lookup_value_source" AS ENUM('field', 'constant', 'formula');
  CREATE TYPE "public"."enum__tools_v_version_steps_type" AS ENUM('question', 'info', 'branch', 'calculation', 'checklist', 'result', 'cta');
  CREATE TYPE "public"."enum__tools_v_version_results_status" AS ENUM('success', 'warning', 'error', 'info');
  CREATE TYPE "public"."enum__tools_v_version_tool_type" AS ENUM('calculator', 'scenario', 'checklist', 'checker', 'ai');
  CREATE TYPE "public"."enum__tools_v_version_execution_mode" AS ENUM('runtime', 'provider');
  CREATE TYPE "public"."enum__tools_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_data_tables_columns_type" AS ENUM('text', 'number', 'date', 'currency');
  CREATE TYPE "public"."enum_data_tables_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__data_tables_v_version_columns_type" AS ENUM('text', 'number', 'date', 'currency');
  CREATE TYPE "public"."enum__data_tables_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "pages_blocks_article_meta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"reviewed" varchar,
  	"reading_time" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quick_answer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_notice" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_warning" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_legal_source" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Правовое основание',
  	"content" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_related_guide" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"title" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_link_card_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"title" varchar,
  	"description" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_link_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_consultation_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"context" varchar,
  	"secondary_href" varchar,
  	"secondary_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar,
  	"source_key" varchar,
  	"kind" "enum_pages_kind" DEFAULT 'article',
  	"title" varchar,
  	"description" varchar,
  	"eyebrow" varchar,
  	"reviewed_at" timestamp(3) with time zone,
  	"reading_time" varchar,
  	"content" jsonb,
  	"legacy_markdown" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_no_index" boolean,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_article_meta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"reviewed" varchar,
  	"reading_time" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quick_answer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_notice" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_warning" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_legal_source" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Правовое основание',
  	"content" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_related_guide" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_card_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"title" varchar,
  	"description" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_card_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_consultation_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"context" varchar,
  	"secondary_href" varchar,
  	"secondary_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_path" varchar,
  	"version_source_key" varchar,
  	"version_kind" "enum__pages_v_version_kind" DEFAULT 'article',
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_eyebrow" varchar,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_reading_time" varchar,
  	"version_content" jsonb,
  	"version_legacy_markdown" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_no_index" boolean,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "tools_fields_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "tools_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"type" "enum_tools_fields_type",
  	"required" boolean,
  	"placeholder" varchar,
  	"help_text" varchar,
  	"min" numeric,
  	"max" numeric,
  	"step" numeric,
  	"default_value" varchar
  );
  
  CREATE TABLE "tools_formulas_operands" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_tools_formulas_operands_source",
  	"field" varchar,
  	"value" varchar,
  	"formula" varchar
  );
  
  CREATE TABLE "tools_formulas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"kind" "enum_tools_formulas_kind",
  	"left_source" "enum_tools_formulas_left_source" DEFAULT 'field',
  	"left_field" varchar,
  	"left_value" varchar,
  	"left_formula" varchar,
  	"right_source" "enum_tools_formulas_right_source" DEFAULT 'field',
  	"right_field" varchar,
  	"right_value" varchar,
  	"right_formula" varchar,
  	"digits" numeric,
  	"days_source" "enum_tools_formulas_days_source" DEFAULT 'field',
  	"days_field" varchar,
  	"days_value" varchar,
  	"days_formula" varchar,
  	"condition" jsonb,
  	"then_value_source" "enum_tools_formulas_then_value_source" DEFAULT 'field',
  	"then_value_field" varchar,
  	"then_value_value" varchar,
  	"then_value_formula" varchar,
  	"else_value_source" "enum_tools_formulas_else_value_source" DEFAULT 'field',
  	"else_value_field" varchar,
  	"else_value_value" varchar,
  	"else_value_formula" varchar,
  	"table_key" varchar,
  	"lookup_field" varchar,
  	"lookup_value_source" "enum_tools_formulas_lookup_value_source" DEFAULT 'field',
  	"lookup_value_field" varchar,
  	"lookup_value_value" varchar,
  	"lookup_value_formula" varchar,
  	"result_field" varchar
  );
  
  CREATE TABLE "tools_steps_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "tools_steps_branches" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"condition" jsonb,
  	"next_step_id" varchar
  );
  
  CREATE TABLE "tools_steps_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"description" varchar,
  	"group" varchar,
  	"condition" jsonb
  );
  
  CREATE TABLE "tools_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_tools_steps_type",
  	"title" varchar,
  	"body" varchar,
  	"field_key" varchar,
  	"required" boolean,
  	"formula_key" varchar,
  	"result_key" varchar,
  	"next_step_id" varchar
  );
  
  CREATE TABLE "tools_results_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "tools_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"status" "enum_tools_results_status" DEFAULT 'info',
  	"title" varchar,
  	"body" varchar,
  	"condition" jsonb,
  	"cta_label" varchar,
  	"cta_href" varchar
  );
  
  CREATE TABLE "tools" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"source_key" varchar,
  	"tool_type" "enum_tools_tool_type",
  	"execution_mode" "enum_tools_execution_mode" DEFAULT 'runtime',
  	"title" varchar,
  	"description" varchar,
  	"eyebrow" varchar,
  	"provider_key" varchar,
  	"content" jsonb,
  	"legacy_markdown" varchar,
  	"ui_copy_start_label" varchar,
  	"ui_copy_next_label" varchar,
  	"ui_copy_back_label" varchar,
  	"ui_copy_reset_label" varchar,
  	"ui_copy_calculate_label" varchar,
  	"ui_copy_result_label" varchar,
  	"ui_copy_loading_label" varchar,
  	"ui_copy_error_label" varchar,
  	"ui_copy_empty_label" varchar,
  	"ui_copy_required_label" varchar,
  	"integration_provider_key" varchar,
  	"integration_request_mapping" jsonb,
  	"integration_response_mapping" jsonb,
  	"integration_timeout_ms" numeric DEFAULT 10000,
  	"integration_enabled" boolean,
  	"ai_system_prompt" varchar,
  	"ai_tone" varchar,
  	"ai_answer_format" varchar,
  	"ai_max_sources" numeric,
  	"ai_max_tokens" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_no_index" boolean,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tools_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "tools_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_tools_v_version_fields_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"type" "enum__tools_v_version_fields_type",
  	"required" boolean,
  	"placeholder" varchar,
  	"help_text" varchar,
  	"min" numeric,
  	"max" numeric,
  	"step" numeric,
  	"default_value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_formulas_operands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__tools_v_version_formulas_operands_source",
  	"field" varchar,
  	"value" varchar,
  	"formula" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_formulas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"kind" "enum__tools_v_version_formulas_kind",
  	"left_source" "enum__tools_v_version_formulas_left_source" DEFAULT 'field',
  	"left_field" varchar,
  	"left_value" varchar,
  	"left_formula" varchar,
  	"right_source" "enum__tools_v_version_formulas_right_source" DEFAULT 'field',
  	"right_field" varchar,
  	"right_value" varchar,
  	"right_formula" varchar,
  	"digits" numeric,
  	"days_source" "enum__tools_v_version_formulas_days_source" DEFAULT 'field',
  	"days_field" varchar,
  	"days_value" varchar,
  	"days_formula" varchar,
  	"condition" jsonb,
  	"then_value_source" "enum__tools_v_version_formulas_then_value_source" DEFAULT 'field',
  	"then_value_field" varchar,
  	"then_value_value" varchar,
  	"then_value_formula" varchar,
  	"else_value_source" "enum__tools_v_version_formulas_else_value_source" DEFAULT 'field',
  	"else_value_field" varchar,
  	"else_value_value" varchar,
  	"else_value_formula" varchar,
  	"table_key" varchar,
  	"lookup_field" varchar,
  	"lookup_value_source" "enum__tools_v_version_formulas_lookup_value_source" DEFAULT 'field',
  	"lookup_value_field" varchar,
  	"lookup_value_value" varchar,
  	"lookup_value_formula" varchar,
  	"result_field" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_steps_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_steps_branches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"condition" jsonb,
  	"next_step_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_steps_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"description" varchar,
  	"group" varchar,
  	"condition" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"type" "enum__tools_v_version_steps_type",
  	"title" varchar,
  	"body" varchar,
  	"field_key" varchar,
  	"required" boolean,
  	"formula_key" varchar,
  	"result_key" varchar,
  	"next_step_id" varchar
  );
  
  CREATE TABLE "_tools_v_version_results_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v_version_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"status" "enum__tools_v_version_results_status" DEFAULT 'info',
  	"title" varchar,
  	"body" varchar,
  	"condition" jsonb,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tools_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_source_key" varchar,
  	"version_tool_type" "enum__tools_v_version_tool_type",
  	"version_execution_mode" "enum__tools_v_version_execution_mode" DEFAULT 'runtime',
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_eyebrow" varchar,
  	"version_provider_key" varchar,
  	"version_content" jsonb,
  	"version_legacy_markdown" varchar,
  	"version_ui_copy_start_label" varchar,
  	"version_ui_copy_next_label" varchar,
  	"version_ui_copy_back_label" varchar,
  	"version_ui_copy_reset_label" varchar,
  	"version_ui_copy_calculate_label" varchar,
  	"version_ui_copy_result_label" varchar,
  	"version_ui_copy_loading_label" varchar,
  	"version_ui_copy_error_label" varchar,
  	"version_ui_copy_empty_label" varchar,
  	"version_ui_copy_required_label" varchar,
  	"version_integration_provider_key" varchar,
  	"version_integration_request_mapping" jsonb,
  	"version_integration_response_mapping" jsonb,
  	"version_integration_timeout_ms" numeric DEFAULT 10000,
  	"version_integration_enabled" boolean,
  	"version_ai_system_prompt" varchar,
  	"version_ai_tone" varchar,
  	"version_ai_answer_format" varchar,
  	"version_ai_max_sources" numeric,
  	"version_ai_max_tokens" numeric,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_no_index" boolean,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tools_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_tools_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "data_tables_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"type" "enum_data_tables_columns_type"
  );
  
  CREATE TABLE "data_tables_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"effective_from" timestamp(3) with time zone,
  	"effective_to" timestamp(3) with time zone,
  	"values" jsonb
  );
  
  CREATE TABLE "data_tables" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"source_key" varchar,
  	"title" varchar,
  	"source_title" varchar,
  	"source_url" varchar,
  	"source_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_data_tables_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_data_tables_v_version_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"type" "enum__data_tables_v_version_columns_type",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_data_tables_v_version_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"effective_from" timestamp(3) with time zone,
  	"effective_to" timestamp(3) with time zone,
  	"values" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_data_tables_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_key" varchar,
  	"version_source_key" varchar,
  	"version_title" varchar,
  	"version_source_title" varchar,
  	"version_source_url" varchar,
  	"version_source_date" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__data_tables_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "rule_test_cases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"source_key" varchar,
  	"tool_id" integer NOT NULL,
  	"answers" jsonb NOT NULL,
  	"expected_status" varchar NOT NULL,
  	"expected_values" jsonb,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"tools_id" integer,
  	"data_tables_id" integer,
  	"rule_test_cases_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar,
  	"site_description" varchar,
  	"site_url" varchar,
  	"default_title" varchar,
  	"default_description" varchar,
  	"partner_phone" varchar,
  	"organization_name" varchar,
  	"organization_description" varchar,
  	"default_og_image_id" integer,
  	"_status" "enum_site_settings_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar,
  	"version_site_description" varchar,
  	"version_site_url" varchar,
  	"version_default_title" varchar,
  	"version_default_description" varchar,
  	"version_partner_phone" varchar,
  	"version_organization_name" varchar,
  	"version_organization_description" varchar,
  	"version_default_og_image_id" integer,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_article_meta" ADD CONSTRAINT "pages_blocks_article_meta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quick_answer" ADD CONSTRAINT "pages_blocks_quick_answer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_notice" ADD CONSTRAINT "pages_blocks_notice_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_warning" ADD CONSTRAINT "pages_blocks_warning_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_legal_source" ADD CONSTRAINT "pages_blocks_legal_source_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_accordion_items" ADD CONSTRAINT "pages_blocks_faq_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_accordion" ADD CONSTRAINT "pages_blocks_faq_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_related_guide" ADD CONSTRAINT "pages_blocks_related_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_card_grid_items" ADD CONSTRAINT "pages_blocks_link_card_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_link_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_card_grid" ADD CONSTRAINT "pages_blocks_link_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_consultation_banner" ADD CONSTRAINT "pages_blocks_consultation_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_article_meta" ADD CONSTRAINT "_pages_v_blocks_article_meta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quick_answer" ADD CONSTRAINT "_pages_v_blocks_quick_answer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_notice" ADD CONSTRAINT "_pages_v_blocks_notice_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_warning" ADD CONSTRAINT "_pages_v_blocks_warning_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_legal_source" ADD CONSTRAINT "_pages_v_blocks_legal_source_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_accordion_items" ADD CONSTRAINT "_pages_v_blocks_faq_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_accordion" ADD CONSTRAINT "_pages_v_blocks_faq_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_related_guide" ADD CONSTRAINT "_pages_v_blocks_related_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_card_grid_items" ADD CONSTRAINT "_pages_v_blocks_link_card_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_link_card_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_card_grid" ADD CONSTRAINT "_pages_v_blocks_link_card_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_consultation_banner" ADD CONSTRAINT "_pages_v_blocks_consultation_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_fields_options" ADD CONSTRAINT "tools_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_fields" ADD CONSTRAINT "tools_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_formulas_operands" ADD CONSTRAINT "tools_formulas_operands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_formulas" ADD CONSTRAINT "tools_formulas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_steps_options" ADD CONSTRAINT "tools_steps_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_steps_branches" ADD CONSTRAINT "tools_steps_branches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_steps_checklist_items" ADD CONSTRAINT "tools_steps_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_steps" ADD CONSTRAINT "tools_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_results_links" ADD CONSTRAINT "tools_results_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools_results" ADD CONSTRAINT "tools_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tools" ADD CONSTRAINT "tools_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tools_texts" ADD CONSTRAINT "tools_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_fields_options" ADD CONSTRAINT "_tools_v_version_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_version_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_fields" ADD CONSTRAINT "_tools_v_version_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_formulas_operands" ADD CONSTRAINT "_tools_v_version_formulas_operands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_version_formulas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_formulas" ADD CONSTRAINT "_tools_v_version_formulas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_steps_options" ADD CONSTRAINT "_tools_v_version_steps_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_version_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_steps_branches" ADD CONSTRAINT "_tools_v_version_steps_branches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_version_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_steps_checklist_items" ADD CONSTRAINT "_tools_v_version_steps_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_version_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_steps" ADD CONSTRAINT "_tools_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_results_links" ADD CONSTRAINT "_tools_v_version_results_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v_version_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v_version_results" ADD CONSTRAINT "_tools_v_version_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tools_v" ADD CONSTRAINT "_tools_v_parent_id_tools_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tools_v" ADD CONSTRAINT "_tools_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tools_v_texts" ADD CONSTRAINT "_tools_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "data_tables_columns" ADD CONSTRAINT "data_tables_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."data_tables"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "data_tables_rows" ADD CONSTRAINT "data_tables_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."data_tables"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_data_tables_v_version_columns" ADD CONSTRAINT "_data_tables_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_data_tables_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_data_tables_v_version_rows" ADD CONSTRAINT "_data_tables_v_version_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_data_tables_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_data_tables_v" ADD CONSTRAINT "_data_tables_v_parent_id_data_tables_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."data_tables"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rule_test_cases" ADD CONSTRAINT "rule_test_cases_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_data_tables_fk" FOREIGN KEY ("data_tables_id") REFERENCES "public"."data_tables"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rule_test_cases_fk" FOREIGN KEY ("rule_test_cases_id") REFERENCES "public"."rule_test_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_default_og_image_id_media_id_fk" FOREIGN KEY ("version_default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "pages_blocks_article_meta_order_idx" ON "pages_blocks_article_meta" USING btree ("_order");
  CREATE INDEX "pages_blocks_article_meta_parent_id_idx" ON "pages_blocks_article_meta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_article_meta_path_idx" ON "pages_blocks_article_meta" USING btree ("_path");
  CREATE INDEX "pages_blocks_quick_answer_order_idx" ON "pages_blocks_quick_answer" USING btree ("_order");
  CREATE INDEX "pages_blocks_quick_answer_parent_id_idx" ON "pages_blocks_quick_answer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quick_answer_path_idx" ON "pages_blocks_quick_answer" USING btree ("_path");
  CREATE INDEX "pages_blocks_notice_order_idx" ON "pages_blocks_notice" USING btree ("_order");
  CREATE INDEX "pages_blocks_notice_parent_id_idx" ON "pages_blocks_notice" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_notice_path_idx" ON "pages_blocks_notice" USING btree ("_path");
  CREATE INDEX "pages_blocks_warning_order_idx" ON "pages_blocks_warning" USING btree ("_order");
  CREATE INDEX "pages_blocks_warning_parent_id_idx" ON "pages_blocks_warning" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_warning_path_idx" ON "pages_blocks_warning" USING btree ("_path");
  CREATE INDEX "pages_blocks_legal_source_order_idx" ON "pages_blocks_legal_source" USING btree ("_order");
  CREATE INDEX "pages_blocks_legal_source_parent_id_idx" ON "pages_blocks_legal_source" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_legal_source_path_idx" ON "pages_blocks_legal_source" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_accordion_items_order_idx" ON "pages_blocks_faq_accordion_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_accordion_items_parent_id_idx" ON "pages_blocks_faq_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_accordion_order_idx" ON "pages_blocks_faq_accordion" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_accordion_parent_id_idx" ON "pages_blocks_faq_accordion" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_accordion_path_idx" ON "pages_blocks_faq_accordion" USING btree ("_path");
  CREATE INDEX "pages_blocks_related_guide_order_idx" ON "pages_blocks_related_guide" USING btree ("_order");
  CREATE INDEX "pages_blocks_related_guide_parent_id_idx" ON "pages_blocks_related_guide" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_related_guide_path_idx" ON "pages_blocks_related_guide" USING btree ("_path");
  CREATE INDEX "pages_blocks_link_card_grid_items_order_idx" ON "pages_blocks_link_card_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_link_card_grid_items_parent_id_idx" ON "pages_blocks_link_card_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_link_card_grid_order_idx" ON "pages_blocks_link_card_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_link_card_grid_parent_id_idx" ON "pages_blocks_link_card_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_link_card_grid_path_idx" ON "pages_blocks_link_card_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_consultation_banner_order_idx" ON "pages_blocks_consultation_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_consultation_banner_parent_id_idx" ON "pages_blocks_consultation_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_consultation_banner_path_idx" ON "pages_blocks_consultation_banner" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE UNIQUE INDEX "pages_source_key_idx" ON "pages" USING btree ("source_key");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_blocks_article_meta_order_idx" ON "_pages_v_blocks_article_meta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_article_meta_parent_id_idx" ON "_pages_v_blocks_article_meta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_article_meta_path_idx" ON "_pages_v_blocks_article_meta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_quick_answer_order_idx" ON "_pages_v_blocks_quick_answer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quick_answer_parent_id_idx" ON "_pages_v_blocks_quick_answer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quick_answer_path_idx" ON "_pages_v_blocks_quick_answer" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_notice_order_idx" ON "_pages_v_blocks_notice" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_notice_parent_id_idx" ON "_pages_v_blocks_notice" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_notice_path_idx" ON "_pages_v_blocks_notice" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_warning_order_idx" ON "_pages_v_blocks_warning" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_warning_parent_id_idx" ON "_pages_v_blocks_warning" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_warning_path_idx" ON "_pages_v_blocks_warning" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_legal_source_order_idx" ON "_pages_v_blocks_legal_source" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_legal_source_parent_id_idx" ON "_pages_v_blocks_legal_source" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_legal_source_path_idx" ON "_pages_v_blocks_legal_source" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_accordion_items_order_idx" ON "_pages_v_blocks_faq_accordion_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_accordion_items_parent_id_idx" ON "_pages_v_blocks_faq_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_accordion_order_idx" ON "_pages_v_blocks_faq_accordion" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_accordion_parent_id_idx" ON "_pages_v_blocks_faq_accordion" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_accordion_path_idx" ON "_pages_v_blocks_faq_accordion" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_related_guide_order_idx" ON "_pages_v_blocks_related_guide" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_related_guide_parent_id_idx" ON "_pages_v_blocks_related_guide" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_related_guide_path_idx" ON "_pages_v_blocks_related_guide" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_link_card_grid_items_order_idx" ON "_pages_v_blocks_link_card_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_card_grid_items_parent_id_idx" ON "_pages_v_blocks_link_card_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_card_grid_order_idx" ON "_pages_v_blocks_link_card_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_card_grid_parent_id_idx" ON "_pages_v_blocks_link_card_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_card_grid_path_idx" ON "_pages_v_blocks_link_card_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_consultation_banner_order_idx" ON "_pages_v_blocks_consultation_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_consultation_banner_parent_id_idx" ON "_pages_v_blocks_consultation_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_consultation_banner_path_idx" ON "_pages_v_blocks_consultation_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");
  CREATE INDEX "_pages_v_version_version_source_key_idx" ON "_pages_v" USING btree ("version_source_key");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "tools_fields_options_order_idx" ON "tools_fields_options" USING btree ("_order");
  CREATE INDEX "tools_fields_options_parent_id_idx" ON "tools_fields_options" USING btree ("_parent_id");
  CREATE INDEX "tools_fields_order_idx" ON "tools_fields" USING btree ("_order");
  CREATE INDEX "tools_fields_parent_id_idx" ON "tools_fields" USING btree ("_parent_id");
  CREATE INDEX "tools_formulas_operands_order_idx" ON "tools_formulas_operands" USING btree ("_order");
  CREATE INDEX "tools_formulas_operands_parent_id_idx" ON "tools_formulas_operands" USING btree ("_parent_id");
  CREATE INDEX "tools_formulas_order_idx" ON "tools_formulas" USING btree ("_order");
  CREATE INDEX "tools_formulas_parent_id_idx" ON "tools_formulas" USING btree ("_parent_id");
  CREATE INDEX "tools_steps_options_order_idx" ON "tools_steps_options" USING btree ("_order");
  CREATE INDEX "tools_steps_options_parent_id_idx" ON "tools_steps_options" USING btree ("_parent_id");
  CREATE INDEX "tools_steps_branches_order_idx" ON "tools_steps_branches" USING btree ("_order");
  CREATE INDEX "tools_steps_branches_parent_id_idx" ON "tools_steps_branches" USING btree ("_parent_id");
  CREATE INDEX "tools_steps_checklist_items_order_idx" ON "tools_steps_checklist_items" USING btree ("_order");
  CREATE INDEX "tools_steps_checklist_items_parent_id_idx" ON "tools_steps_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "tools_steps_order_idx" ON "tools_steps" USING btree ("_order");
  CREATE INDEX "tools_steps_parent_id_idx" ON "tools_steps" USING btree ("_parent_id");
  CREATE INDEX "tools_results_links_order_idx" ON "tools_results_links" USING btree ("_order");
  CREATE INDEX "tools_results_links_parent_id_idx" ON "tools_results_links" USING btree ("_parent_id");
  CREATE INDEX "tools_results_order_idx" ON "tools_results" USING btree ("_order");
  CREATE INDEX "tools_results_parent_id_idx" ON "tools_results" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tools_slug_idx" ON "tools" USING btree ("slug");
  CREATE UNIQUE INDEX "tools_source_key_idx" ON "tools" USING btree ("source_key");
  CREATE INDEX "tools_seo_seo_og_image_idx" ON "tools" USING btree ("seo_og_image_id");
  CREATE INDEX "tools_updated_at_idx" ON "tools" USING btree ("updated_at");
  CREATE INDEX "tools_created_at_idx" ON "tools" USING btree ("created_at");
  CREATE INDEX "tools__status_idx" ON "tools" USING btree ("_status");
  CREATE INDEX "tools_texts_order_parent" ON "tools_texts" USING btree ("order","parent_id");
  CREATE INDEX "_tools_v_version_fields_options_order_idx" ON "_tools_v_version_fields_options" USING btree ("_order");
  CREATE INDEX "_tools_v_version_fields_options_parent_id_idx" ON "_tools_v_version_fields_options" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_fields_order_idx" ON "_tools_v_version_fields" USING btree ("_order");
  CREATE INDEX "_tools_v_version_fields_parent_id_idx" ON "_tools_v_version_fields" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_formulas_operands_order_idx" ON "_tools_v_version_formulas_operands" USING btree ("_order");
  CREATE INDEX "_tools_v_version_formulas_operands_parent_id_idx" ON "_tools_v_version_formulas_operands" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_formulas_order_idx" ON "_tools_v_version_formulas" USING btree ("_order");
  CREATE INDEX "_tools_v_version_formulas_parent_id_idx" ON "_tools_v_version_formulas" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_steps_options_order_idx" ON "_tools_v_version_steps_options" USING btree ("_order");
  CREATE INDEX "_tools_v_version_steps_options_parent_id_idx" ON "_tools_v_version_steps_options" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_steps_branches_order_idx" ON "_tools_v_version_steps_branches" USING btree ("_order");
  CREATE INDEX "_tools_v_version_steps_branches_parent_id_idx" ON "_tools_v_version_steps_branches" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_steps_checklist_items_order_idx" ON "_tools_v_version_steps_checklist_items" USING btree ("_order");
  CREATE INDEX "_tools_v_version_steps_checklist_items_parent_id_idx" ON "_tools_v_version_steps_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_steps_order_idx" ON "_tools_v_version_steps" USING btree ("_order");
  CREATE INDEX "_tools_v_version_steps_parent_id_idx" ON "_tools_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_results_links_order_idx" ON "_tools_v_version_results_links" USING btree ("_order");
  CREATE INDEX "_tools_v_version_results_links_parent_id_idx" ON "_tools_v_version_results_links" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_version_results_order_idx" ON "_tools_v_version_results" USING btree ("_order");
  CREATE INDEX "_tools_v_version_results_parent_id_idx" ON "_tools_v_version_results" USING btree ("_parent_id");
  CREATE INDEX "_tools_v_parent_idx" ON "_tools_v" USING btree ("parent_id");
  CREATE INDEX "_tools_v_version_version_slug_idx" ON "_tools_v" USING btree ("version_slug");
  CREATE INDEX "_tools_v_version_version_source_key_idx" ON "_tools_v" USING btree ("version_source_key");
  CREATE INDEX "_tools_v_version_seo_version_seo_og_image_idx" ON "_tools_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_tools_v_version_version_updated_at_idx" ON "_tools_v" USING btree ("version_updated_at");
  CREATE INDEX "_tools_v_version_version_created_at_idx" ON "_tools_v" USING btree ("version_created_at");
  CREATE INDEX "_tools_v_version_version__status_idx" ON "_tools_v" USING btree ("version__status");
  CREATE INDEX "_tools_v_created_at_idx" ON "_tools_v" USING btree ("created_at");
  CREATE INDEX "_tools_v_updated_at_idx" ON "_tools_v" USING btree ("updated_at");
  CREATE INDEX "_tools_v_latest_idx" ON "_tools_v" USING btree ("latest");
  CREATE INDEX "_tools_v_autosave_idx" ON "_tools_v" USING btree ("autosave");
  CREATE INDEX "_tools_v_texts_order_parent" ON "_tools_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "data_tables_columns_order_idx" ON "data_tables_columns" USING btree ("_order");
  CREATE INDEX "data_tables_columns_parent_id_idx" ON "data_tables_columns" USING btree ("_parent_id");
  CREATE INDEX "data_tables_rows_order_idx" ON "data_tables_rows" USING btree ("_order");
  CREATE INDEX "data_tables_rows_parent_id_idx" ON "data_tables_rows" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "data_tables_key_idx" ON "data_tables" USING btree ("key");
  CREATE UNIQUE INDEX "data_tables_source_key_idx" ON "data_tables" USING btree ("source_key");
  CREATE INDEX "data_tables_updated_at_idx" ON "data_tables" USING btree ("updated_at");
  CREATE INDEX "data_tables_created_at_idx" ON "data_tables" USING btree ("created_at");
  CREATE INDEX "data_tables__status_idx" ON "data_tables" USING btree ("_status");
  CREATE INDEX "_data_tables_v_version_columns_order_idx" ON "_data_tables_v_version_columns" USING btree ("_order");
  CREATE INDEX "_data_tables_v_version_columns_parent_id_idx" ON "_data_tables_v_version_columns" USING btree ("_parent_id");
  CREATE INDEX "_data_tables_v_version_rows_order_idx" ON "_data_tables_v_version_rows" USING btree ("_order");
  CREATE INDEX "_data_tables_v_version_rows_parent_id_idx" ON "_data_tables_v_version_rows" USING btree ("_parent_id");
  CREATE INDEX "_data_tables_v_parent_idx" ON "_data_tables_v" USING btree ("parent_id");
  CREATE INDEX "_data_tables_v_version_version_key_idx" ON "_data_tables_v" USING btree ("version_key");
  CREATE INDEX "_data_tables_v_version_version_source_key_idx" ON "_data_tables_v" USING btree ("version_source_key");
  CREATE INDEX "_data_tables_v_version_version_updated_at_idx" ON "_data_tables_v" USING btree ("version_updated_at");
  CREATE INDEX "_data_tables_v_version_version_created_at_idx" ON "_data_tables_v" USING btree ("version_created_at");
  CREATE INDEX "_data_tables_v_version_version__status_idx" ON "_data_tables_v" USING btree ("version__status");
  CREATE INDEX "_data_tables_v_created_at_idx" ON "_data_tables_v" USING btree ("created_at");
  CREATE INDEX "_data_tables_v_updated_at_idx" ON "_data_tables_v" USING btree ("updated_at");
  CREATE INDEX "_data_tables_v_latest_idx" ON "_data_tables_v" USING btree ("latest");
  CREATE UNIQUE INDEX "rule_test_cases_source_key_idx" ON "rule_test_cases" USING btree ("source_key");
  CREATE INDEX "rule_test_cases_tool_idx" ON "rule_test_cases" USING btree ("tool_id");
  CREATE INDEX "rule_test_cases_updated_at_idx" ON "rule_test_cases" USING btree ("updated_at");
  CREATE INDEX "rule_test_cases_created_at_idx" ON "rule_test_cases" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_tools_id_idx" ON "payload_locked_documents_rels" USING btree ("tools_id");
  CREATE INDEX "payload_locked_documents_rels_data_tables_id_idx" ON "payload_locked_documents_rels" USING btree ("data_tables_id");
  CREATE INDEX "payload_locked_documents_rels_rule_test_cases_id_idx" ON "payload_locked_documents_rels" USING btree ("rule_test_cases_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "_site_settings_v_version_version_default_og_image_idx" ON "_site_settings_v" USING btree ("version_default_og_image_id");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "pages_blocks_article_meta" CASCADE;
  DROP TABLE "pages_blocks_quick_answer" CASCADE;
  DROP TABLE "pages_blocks_notice" CASCADE;
  DROP TABLE "pages_blocks_warning" CASCADE;
  DROP TABLE "pages_blocks_legal_source" CASCADE;
  DROP TABLE "pages_blocks_faq_accordion_items" CASCADE;
  DROP TABLE "pages_blocks_faq_accordion" CASCADE;
  DROP TABLE "pages_blocks_related_guide" CASCADE;
  DROP TABLE "pages_blocks_link_card_grid_items" CASCADE;
  DROP TABLE "pages_blocks_link_card_grid" CASCADE;
  DROP TABLE "pages_blocks_consultation_banner" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_article_meta" CASCADE;
  DROP TABLE "_pages_v_blocks_quick_answer" CASCADE;
  DROP TABLE "_pages_v_blocks_notice" CASCADE;
  DROP TABLE "_pages_v_blocks_warning" CASCADE;
  DROP TABLE "_pages_v_blocks_legal_source" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_accordion_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_accordion" CASCADE;
  DROP TABLE "_pages_v_blocks_related_guide" CASCADE;
  DROP TABLE "_pages_v_blocks_link_card_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_link_card_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_consultation_banner" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "tools_fields_options" CASCADE;
  DROP TABLE "tools_fields" CASCADE;
  DROP TABLE "tools_formulas_operands" CASCADE;
  DROP TABLE "tools_formulas" CASCADE;
  DROP TABLE "tools_steps_options" CASCADE;
  DROP TABLE "tools_steps_branches" CASCADE;
  DROP TABLE "tools_steps_checklist_items" CASCADE;
  DROP TABLE "tools_steps" CASCADE;
  DROP TABLE "tools_results_links" CASCADE;
  DROP TABLE "tools_results" CASCADE;
  DROP TABLE "tools" CASCADE;
  DROP TABLE "tools_texts" CASCADE;
  DROP TABLE "_tools_v_version_fields_options" CASCADE;
  DROP TABLE "_tools_v_version_fields" CASCADE;
  DROP TABLE "_tools_v_version_formulas_operands" CASCADE;
  DROP TABLE "_tools_v_version_formulas" CASCADE;
  DROP TABLE "_tools_v_version_steps_options" CASCADE;
  DROP TABLE "_tools_v_version_steps_branches" CASCADE;
  DROP TABLE "_tools_v_version_steps_checklist_items" CASCADE;
  DROP TABLE "_tools_v_version_steps" CASCADE;
  DROP TABLE "_tools_v_version_results_links" CASCADE;
  DROP TABLE "_tools_v_version_results" CASCADE;
  DROP TABLE "_tools_v" CASCADE;
  DROP TABLE "_tools_v_texts" CASCADE;
  DROP TABLE "data_tables_columns" CASCADE;
  DROP TABLE "data_tables_rows" CASCADE;
  DROP TABLE "data_tables" CASCADE;
  DROP TABLE "_data_tables_v_version_columns" CASCADE;
  DROP TABLE "_data_tables_v_version_rows" CASCADE;
  DROP TABLE "_data_tables_v" CASCADE;
  DROP TABLE "rule_test_cases" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_pages_kind";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_kind";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_tools_fields_type";
  DROP TYPE "public"."enum_tools_formulas_operands_source";
  DROP TYPE "public"."enum_tools_formulas_kind";
  DROP TYPE "public"."enum_tools_formulas_left_source";
  DROP TYPE "public"."enum_tools_formulas_right_source";
  DROP TYPE "public"."enum_tools_formulas_days_source";
  DROP TYPE "public"."enum_tools_formulas_then_value_source";
  DROP TYPE "public"."enum_tools_formulas_else_value_source";
  DROP TYPE "public"."enum_tools_formulas_lookup_value_source";
  DROP TYPE "public"."enum_tools_steps_type";
  DROP TYPE "public"."enum_tools_results_status";
  DROP TYPE "public"."enum_tools_tool_type";
  DROP TYPE "public"."enum_tools_execution_mode";
  DROP TYPE "public"."enum_tools_status";
  DROP TYPE "public"."enum__tools_v_version_fields_type";
  DROP TYPE "public"."enum__tools_v_version_formulas_operands_source";
  DROP TYPE "public"."enum__tools_v_version_formulas_kind";
  DROP TYPE "public"."enum__tools_v_version_formulas_left_source";
  DROP TYPE "public"."enum__tools_v_version_formulas_right_source";
  DROP TYPE "public"."enum__tools_v_version_formulas_days_source";
  DROP TYPE "public"."enum__tools_v_version_formulas_then_value_source";
  DROP TYPE "public"."enum__tools_v_version_formulas_else_value_source";
  DROP TYPE "public"."enum__tools_v_version_formulas_lookup_value_source";
  DROP TYPE "public"."enum__tools_v_version_steps_type";
  DROP TYPE "public"."enum__tools_v_version_results_status";
  DROP TYPE "public"."enum__tools_v_version_tool_type";
  DROP TYPE "public"."enum__tools_v_version_execution_mode";
  DROP TYPE "public"."enum__tools_v_version_status";
  DROP TYPE "public"."enum_data_tables_columns_type";
  DROP TYPE "public"."enum_data_tables_status";
  DROP TYPE "public"."enum__data_tables_v_version_columns_type";
  DROP TYPE "public"."enum__data_tables_v_version_status";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_status";`)
}
