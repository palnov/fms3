import path from "node:path";
import type { CollectionConfig } from "payload";
import { canAccessAdmin, canEditContent, canManageUsers, canPublishContent, publishedOnly } from "./access";
import { pageContentBlocks } from "./blocks";
import { seoFields, toolDefinitionFields } from "./fields";
import { revalidateDataTable, revalidatePage, revalidateTool } from "./hooks";
import { validateDataTable, validatePage, validateTool } from "./validation";

const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), ".data");

const versionConfig = {
  drafts: { autosave: { interval: 250 } },
  maxPerDoc: 20,
};

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Пользователь CMS", plural: "Пользователи CMS" },
  auth: true,
  admin: { useAsTitle: "email", defaultColumns: ["email", "role", "updatedAt"] },
  access: {
    admin: canAccessAdmin,
    read: canManageUsers,
    create: canManageUsers,
    update: canManageUsers,
    delete: canManageUsers,
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Администратор", value: "admin" },
        { label: "Редактор", value: "editor" },
        { label: "Публикатор", value: "publisher" },
      ],
    },
  ],
};

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Медиафайл", plural: "Медиафайлы" },
  access: {
    admin: canAccessAdmin,
    read: () => true,
    create: canEditContent,
    update: canEditContent,
    delete: canManageUsers,
  },
  upload: {
    staticDir: path.resolve(dataDir, "media"),
    mimeTypes: ["image/*", "application/pdf"],
    adminThumbnail: "thumbnail",
    imageSizes: [{ name: "thumbnail", width: 480, height: 320, position: "centre" }],
  },
  fields: [{ name: "alt", type: "text", required: true, label: "Alt-текст" }],
};

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Страница", plural: "Страницы" },
  admin: { useAsTitle: "title", defaultColumns: ["path", "title", "kind", "_status", "updatedAt"] },
  versions: versionConfig,
  access: {
    admin: canAccessAdmin,
    read: publishedOnly,
    create: canEditContent,
    update: canEditContent,
    delete: canPublishContent,
  },
  hooks: { beforeValidate: [validatePage], afterChange: [revalidatePage] },
  fields: [
    { name: "path", type: "text", required: true, unique: true, index: true, label: "Публичный URL" },
    { name: "sourceKey", type: "text", unique: true, index: true, admin: { readOnly: true, position: "sidebar" } },
    { name: "homeContent", type: "json", label: "Контент главной страницы", admin: { description: "Структурированные тексты, ссылки и карточки главной страницы. Заполняется только для URL /. Не меняет визуальный шаблон." } },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "article",
      options: [
        { label: "Статья", value: "article" },
        { label: "Лендинг", value: "landing" },
        { label: "Правовая страница", value: "legal" },
        { label: "Политика", value: "policy" },
      ],
    },
    { name: "title", type: "text", required: true, label: "Заголовок" },
    { name: "description", type: "textarea", required: true, label: "Описание" },
    { name: "eyebrow", type: "text", label: "Надзаголовок" },
    { name: "tags", type: "text", hasMany: true, label: "Теги" },
    { name: "reviewedAt", type: "date", label: "Дата проверки" },
    { name: "readingTime", type: "text", label: "Время чтения" },
    { name: "content", type: "richText", label: "Контент", admin: { description: "Основной контент на Lexical Rich Text с блоками из справочника." } },
    {
      name: "legacyMarkdown",
      type: "textarea",
      label: "Исходный контент миграции",
      admin: { description: "Сохраняется для контроля паритета и повторной миграции.", readOnly: true },
    },
    { name: "contentBlocks", type: "blocks", label: "Служебные блоки", blocks: pageContentBlocks, admin: { hidden: true } },
    seoFields(),
    {
      name: "relatedPages",
      type: "relationship",
      relationTo: "pages",
      hasMany: true,
      label: "Связанные страницы",
    },
  ],
};

export const Tools: CollectionConfig = {
  slug: "tools",
  labels: { singular: "Инструмент", plural: "Инструменты" },
  admin: { useAsTitle: "title", defaultColumns: ["slug", "toolType", "executionMode", "_status", "updatedAt"] },
  versions: versionConfig,
  access: {
    admin: canAccessAdmin,
    read: publishedOnly,
    create: canEditContent,
    update: canEditContent,
    delete: canPublishContent,
  },
  hooks: { beforeValidate: [validateTool], afterChange: [revalidateTool] },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true, label: "Полный URL инструмента" },
    { name: "sourceKey", type: "text", unique: true, index: true, admin: { readOnly: true, position: "sidebar" } },
    {
      name: "toolType",
      type: "select",
      required: true,
      options: [
        { label: "Калькулятор", value: "calculator" },
        { label: "Сценарий", value: "scenario" },
        { label: "Чек-лист", value: "checklist" },
        { label: "Проверка", value: "checker" },
        { label: "AI-инструмент", value: "ai" },
      ],
    },
    {
      name: "executionMode",
      type: "select",
      required: true,
      defaultValue: "runtime",
      options: [
        { label: "No-code runtime", value: "runtime" },
        { label: "Кодовый адаптер", value: "provider" },
      ],
    },
    { name: "title", type: "text", required: true, label: "Заголовок" },
    { name: "description", type: "textarea", required: true, label: "Описание" },
    { name: "eyebrow", type: "text", label: "Надзаголовок" },
    { name: "providerKey", type: "text", label: "Разрешённый ключ адаптера", admin: { description: "Только ключ из реестра адаптеров приложения; URL и секреты здесь не хранятся." } },
    { name: "content", type: "richText", label: "Справочный контент", admin: { description: "Текст вокруг инструмента: пояснения, ограничения, источники и следующие шаги." } },
    { name: "legacyMarkdown", type: "textarea", label: "Исходное описание миграции", admin: { readOnly: true } },
    ...toolDefinitionFields(),
    seoFields(),
    { name: "dataTableKeys", type: "text", hasMany: true, label: "Таблицы данных" },
  ],
};

export const DataTables: CollectionConfig = {
  slug: "data-tables",
  labels: { singular: "Таблица данных", plural: "Таблицы данных" },
  admin: { useAsTitle: "title", defaultColumns: ["key", "title", "updatedAt"] },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { admin: canAccessAdmin, read: publishedOnly, create: canEditContent, update: canEditContent, delete: canPublishContent },
  hooks: { beforeValidate: [validateDataTable], afterChange: [revalidateDataTable] },
  fields: [
    { name: "key", type: "text", required: true, unique: true, index: true, label: "Ключ таблицы" },
    { name: "sourceKey", type: "text", unique: true, index: true, label: "Ключ источника", admin: { readOnly: true, position: "sidebar" } },
    { name: "title", type: "text", required: true, label: "Название" },
    {
      name: "columns",
      type: "array",
      label: "Колонки",
      fields: [
        { name: "key", type: "text", required: true, label: "Ключ" },
        { name: "label", type: "text", required: true, label: "Подпись" },
        { name: "type", type: "select", required: true, label: "Тип", options: ["text", "number", "date", "currency"] },
      ],
    },
    {
      name: "rows",
      type: "array",
      label: "Строки",
      fields: [
        { name: "key", type: "text", required: true, label: "Ключ строки" },
        { name: "effectiveFrom", type: "date", label: "Действует с" },
        { name: "effectiveTo", type: "date", label: "Действует до" },
        { name: "values", type: "json", label: "Значения по колонкам", admin: { maxHeight: 220 } },
      ],
    },
    { name: "sourceTitle", type: "text", label: "Источник" },
    { name: "sourceUrl", type: "text", label: "Ссылка на источник" },
    { name: "sourceDate", type: "date", label: "Дата источника" },
  ],
};

export const RuleTestCases: CollectionConfig = {
  slug: "rule-test-cases",
  labels: { singular: "Тест правила", plural: "Тесты правил" },
  admin: { useAsTitle: "name", defaultColumns: ["name", "tool", "enabled", "updatedAt"] },
  access: { admin: canAccessAdmin, read: canAccessAdmin, create: canEditContent, update: canEditContent, delete: canPublishContent },
  fields: [
    { name: "name", type: "text", required: true, label: "Название теста" },
    { name: "sourceKey", type: "text", unique: true, index: true, label: "Ключ источника", admin: { readOnly: true, position: "sidebar" } },
    { name: "tool", type: "relationship", relationTo: "tools", required: true, label: "Инструмент" },
    { name: "answers", type: "json", required: true, label: "Входные данные", admin: { maxHeight: 240 } },
    { name: "expectedStatus", type: "text", required: true, label: "Ожидаемый статус" },
    { name: "expectedValues", type: "json", label: "Ожидаемые вычисления", admin: { maxHeight: 240 } },
    { name: "enabled", type: "checkbox", defaultValue: true, label: "Включён" },
  ],
};
