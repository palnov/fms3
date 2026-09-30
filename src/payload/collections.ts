import path from "node:path";
import type { CollectionConfig } from "payload";
import { BlocksFeature, EXPERIMENTAL_TableFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { canAccessAdmin, canCreateContent, canDeleteContent, canEditContent, canManageUsers, canUpdateContent, hasRole, publishedOnly } from "./access";
import { pageContentBlocks } from "./blocks";
import { seoFields, toolDefinitionFields } from "./fields";
import { revalidateDataTable, revalidatePage, revalidateTool } from "./hooks";
import { validateDataTable, validatePage, validateTool } from "./validation";
import { createCmsPagePreviewUrl } from "@/lib/cms/preview-token";

const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), ".data");
const previewSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const versionConfig = {
  drafts: { autosave: { interval: 250 } },
  maxPerDoc: 20,
};

const pageContentEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    BlocksFeature({ blocks: pageContentBlocks }),
    EXPERIMENTAL_TableFeature(),
  ],
});

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Пользователь CMS", plural: "Пользователи CMS" },
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "updatedAt"],
    group: "Служебное",
    hidden: ({ user }) => !hasRole(user, ["admin"]),
  },
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
  admin: { group: "Материалы" },
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
  admin: {
    group: "Материалы",
    useAsTitle: "title",
    defaultColumns: ["path", "title", "kind", "_status", "updatedAt"],
    components: {
      beforeList: ["@/components/admin/PageHierarchyShortcut#PageHierarchyShortcut"],
      views: {
        hierarchy: {
          Component: "@/components/admin/PageHierarchyView#PageHierarchyView",
          path: "/hierarchy",
          exact: true,
        },
      },
    },
    livePreview: {
      url: ({ data }) => createCmsPagePreviewUrl(data.path, previewSiteUrl),
      breakpoints: [
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
        { label: "Мобильный", name: "mobile", width: 390, height: 844 },
      ],
    },
  },
  versions: versionConfig,
  access: {
    admin: canAccessAdmin,
    read: publishedOnly,
    create: canCreateContent,
    update: canUpdateContent,
    delete: canDeleteContent,
  },
  hooks: { beforeValidate: [validatePage], afterChange: [revalidatePage] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Основное",
          description: "Заголовок, публичный адрес и тип страницы.",
          fields: [
            { name: "path", type: "text", required: true, unique: true, index: true, label: "Публичный URL" },
            {
              name: "kind",
              type: "select",
              required: true,
              defaultValue: "article",
              label: "Тип страницы",
              admin: {
                description: "Статья использует шаблон материала; лендинг и политика — простой шаблон. Правовая страница пока использует шаблон статьи, публичный вывод этим изменением не меняется.",
              },
              options: [
                { label: "Статья", value: "article" },
                { label: "Лендинг", value: "landing" },
                { label: "Правовая страница", value: "legal" },
                { label: "Политика", value: "policy" },
              ],
            },
            { name: "title", type: "text", required: true, label: "Заголовок" },
            { name: "description", type: "textarea", required: true, label: "Описание" },
            {
              name: "eyebrow",
              type: "text",
              label: "Надзаголовок",
              admin: { condition: (data) => data.kind === "landing" || data.kind === "policy" },
            },
            {
              name: "tags",
              type: "text",
              hasMany: true,
              label: "Теги",
              admin: { condition: (data) => data.kind === "article" },
            },
            {
              name: "reviewedAt",
              type: "date",
              label: "Дата проверки",
              admin: { condition: (data) => data.kind === "article" || data.kind === "legal" },
            },
            {
              name: "readingTime",
              type: "text",
              label: "Время чтения",
              admin: { condition: (data) => data.kind === "article" || data.kind === "legal" },
            },
          ],
        },
        {
          label: "Контент",
          description: "Основной текст страницы и его предпросмотр.",
          fields: [
            {
              name: "content",
              type: "richText",
              label: "Контент",
              editor: pageContentEditor,
              admin: { description: "Таблицу можно вставить через меню редактора; разметка Markdown не нужна." },
            },
            {
              name: "homeContent",
              type: "json",
              label: "Главная страница",
              admin: {
                description: "Поля и списки главной страницы. Показывается только для URL /.",
                condition: (data) => data.path === "/",
                components: { Field: "@/components/admin/HomeContentField#HomeContentField" },
              },
            },
          ],
        },
        {
          label: "SEO",
          description: "Поисковый заголовок, описание и параметры индексации.",
          fields: [
            {
              name: "editorialSeoChecklist",
              type: "ui",
              label: "Проверка перед публикацией",
              admin: { components: { Field: "@/components/admin/SeoChecklist#SeoChecklist" } },
            },
            seoFields(),
          ],
        },
        {
          label: "Связи",
          description: "Редакционная иерархия и подборка связанных материалов. URL при этом не меняется.",
          fields: [
            {
              name: "parent",
              type: "relationship",
              relationTo: "pages",
              label: "Родительская страница",
              admin: { description: "Редакционная иерархия. Публичный URL дочерней страницы не меняется." },
              filterOptions: ({ id }) => id ? { id: { not_equals: id } } : true,
            },
            { name: "treeOrder", type: "number", label: "Порядок среди соседних", defaultValue: 0, min: 0, admin: { description: "Меньшее число показывается выше страниц с тем же родителем." } },
            {
              name: "relatedPages",
              type: "relationship",
              relationTo: "pages",
              hasMany: true,
              label: "Связанные страницы",
            },
          ],
        },
        {
          label: "Импорт",
          description: "Служебные данные исходной миграции. Доступны только администраторам и доступны только для чтения.",
          admin: { condition: (_data, _siblingData, { user }) => hasRole(user, ["admin"]) },
          fields: [
            { name: "sourceKey", type: "text", unique: true, index: true, label: "Ключ источника", admin: { readOnly: true } },
            {
              name: "legacyMarkdown",
              type: "textarea",
              label: "Исходный контент миграции",
              admin: { description: "Архив исходного текста для контроля и повторной миграции.", readOnly: true },
            },
          ],
        },
      ],
    },
    { name: "contentBlocks", type: "blocks", label: "Служебные блоки", blocks: pageContentBlocks, admin: { hidden: true } },
  ],
};

export const Tools: CollectionConfig = {
  slug: "tools",
  labels: { singular: "Инструмент", plural: "Инструменты" },
  admin: { useAsTitle: "title", defaultColumns: ["slug", "toolType", "executionMode", "_status", "updatedAt"], group: "Инструменты" },
  versions: versionConfig,
  access: {
    admin: canAccessAdmin,
    read: publishedOnly,
    create: canCreateContent,
    update: canUpdateContent,
    delete: canDeleteContent,
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
  labels: { singular: "Таблица инструмента", plural: "Таблицы инструментов" },
  admin: { useAsTitle: "title", defaultColumns: ["key", "title", "updatedAt"], group: "Инструменты" },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { admin: canAccessAdmin, read: publishedOnly, create: canCreateContent, update: canUpdateContent, delete: canDeleteContent },
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
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tool", "enabled", "updatedAt"],
    group: "Служебное",
    hidden: ({ user }) => !hasRole(user, ["admin", "editor"]),
  },
  access: { admin: canAccessAdmin, read: canAccessAdmin, create: canEditContent, update: canEditContent, delete: canDeleteContent },
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
