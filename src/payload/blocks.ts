import type { Block } from "payload";

const blockText = (name: string, label: string, description?: string) => ({
  name,
  type: "textarea" as const,
  label,
  admin: { description },
});

function validateLinkTarget(value: unknown, { siblingData }: { siblingData?: unknown }) {
  const siblings = siblingData && typeof siblingData === "object" && !Array.isArray(siblingData)
    ? siblingData as Record<string, unknown>
    : {};
  const hasExternalHref = typeof value === "string" && value.trim().length > 0;
  const hasLegacyHref = typeof siblings.href === "string" && siblings.href.trim().length > 0;
  const hasPage = Boolean(siblings.page);
  return hasExternalHref || hasLegacyHref || hasPage || "Выберите страницу или укажите ссылку.";
}

export const pageContentBlocks: Block[] = [
  {
    slug: "articleMeta",
    labels: { singular: "Метаданные статьи", plural: "Метаданные статьи" },
    fields: [
      { name: "reviewed", type: "text", label: "Проверено" },
      { name: "readingTime", type: "text", label: "Время чтения" },
    ],
  },
  {
    slug: "quickAnswer",
    labels: { singular: "Короткий ответ", plural: "Короткие ответы" },
    fields: [blockText("content", "Текст ответа")],
  },
  {
    slug: "notice",
    labels: { singular: "Обратите внимание", plural: "Обратите внимание" },
    fields: [blockText("content", "Текст заметки")],
  },
  {
    slug: "warning",
    labels: { singular: "Важно", plural: "Важные предупреждения" },
    fields: [blockText("content", "Текст предупреждения")],
  },
  {
    slug: "legalSource",
    labels: { singular: "Правовое основание", plural: "Правовые основания" },
    fields: [
      { name: "title", type: "text", label: "Заголовок", defaultValue: "Правовое основание" },
      blockText("content", "Текст источника"),
    ],
  },
  {
    slug: "faqAccordion",
    labels: { singular: "Вопросы и ответы", plural: "Вопросы и ответы" },
    fields: [
      {
        name: "items",
        type: "array",
        label: "Вопросы",
        minRows: 1,
        fields: [
          { name: "question", type: "text", label: "Вопрос", required: true },
          { name: "answer", type: "textarea", label: "Ответ", required: true },
        ],
      },
    ],
  },
  {
    slug: "relatedGuide",
    labels: { singular: "Следующий шаг", plural: "Следующие шаги" },
    fields: [
      { name: "page", type: "relationship", relationTo: "pages", label: "Внутренняя страница", admin: { description: "Выберите страницу сайта, чтобы ссылка обновлялась вместе с ней." } },
      { name: "externalHref", type: "text", label: "Внешняя ссылка", validate: validateLinkTarget, admin: { description: "Используйте для внешнего адреса или старой ссылки, которую пока нельзя связать со страницей CMS." } },
      { name: "href", type: "text", label: "Старая ссылка", admin: { hidden: true } },
      { name: "title", type: "text", label: "Заголовок", required: true },
      { name: "description", type: "textarea", label: "Описание", required: true },
    ],
  },
  {
    slug: "linkCardGrid",
    labels: { singular: "Сетка ссылок", plural: "Сетки ссылок" },
    fields: [
      {
        name: "items",
        type: "array",
        label: "Карточки",
        fields: [
          { name: "page", type: "relationship", relationTo: "pages", label: "Внутренняя страница", admin: { description: "Выберите страницу сайта, чтобы ссылка обновлялась вместе с ней." } },
          { name: "externalHref", type: "text", label: "Внешняя ссылка", validate: validateLinkTarget, admin: { description: "Используйте для внешнего адреса или старой ссылки, которую пока нельзя связать со страницей CMS." } },
          { name: "href", type: "text", label: "Старая ссылка", admin: { hidden: true } },
          { name: "title", type: "text", label: "Заголовок", required: true },
          { name: "description", type: "textarea", label: "Описание", required: true },
          { name: "label", type: "text", label: "Метка" },
        ],
      },
    ],
  },
  {
    slug: "consultationBanner",
    labels: { singular: "Баннер консультации", plural: "Баннеры консультации" },
    fields: [
      { name: "title", type: "text", label: "Заголовок", required: true },
      { name: "description", type: "textarea", label: "Описание", required: true },
      { name: "context", type: "text", label: "Контекст" },
      { name: "secondaryHref", type: "text", label: "Вторая ссылка" },
      { name: "secondaryLabel", type: "text", label: "Текст второй ссылки" },
    ],
  },
];
