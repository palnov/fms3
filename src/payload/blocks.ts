import type { Block } from "payload";

const blockText = (name: string, label: string, description?: string) => ({
  name,
  type: "textarea" as const,
  label,
  admin: { description },
});

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
      { name: "href", type: "text", label: "Ссылка", required: true },
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
          { name: "href", type: "text", label: "Ссылка", required: true },
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
