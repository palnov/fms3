"use client";

import { useField } from "@payloadcms/ui";
import type { JSONFieldClientComponent } from "payload";
import { DEFAULT_HOME_CONTENT } from "@/lib/home-content";

type SelectOption = { label: string; value: string };
type FieldDefinition = {
  key: string;
  label: string;
  kind?: "text" | "textarea" | "select" | "checkbox" | "lines";
  options?: readonly SelectOption[];
};
type ArrayDefinition = {
  key: string;
  label: string;
  itemLabel: string;
  fields: readonly FieldDefinition[];
  emptyItem: Record<string, unknown>;
};
type SectionDefinition = {
  label: string;
  fields?: readonly FieldDefinition[];
  arrays?: readonly ArrayDefinition[];
};
type HomeRecord = Record<string, unknown>;
type PathPart = string | number;

const iconOptions: readonly SelectOption[] = [
  { label: "Люди", value: "users" },
  { label: "Работа", value: "briefcase" },
  { label: "Учёба", value: "graduation" },
  { label: "Дом", value: "house" },
  { label: "Карта", value: "map" },
  { label: "Маршрут", value: "compass" },
  { label: "ИИ-помощник", value: "bot" },
  { label: "Список", value: "list" },
  { label: "Калькулятор", value: "calculator" },
  { label: "Проверка", value: "shield" },
  { label: "Документ", value: "file" },
];

const blueprintOptions: readonly SelectOption[] = [
  { label: "Маршрут", value: "path" },
  { label: "База знаний", value: "knowledge" },
  { label: "Документы", value: "documents" },
  { label: "Сроки", value: "calendar" },
];

const sections: readonly SectionDefinition[] = [
  {
    label: "Первый экран",
    fields: [
      { key: "heroEyebrow", label: "Надзаголовок" },
      { key: "heroTitleLines", label: "Заголовок — строка", kind: "lines" },
      { key: "heroLead", label: "Краткое описание", kind: "textarea" },
      { key: "heroPrimaryLabel", label: "Текст основной кнопки" },
      { key: "heroPrimaryHref", label: "Ссылка основной кнопки" },
      { key: "heroSecondaryLabel", label: "Текст второй кнопки" },
      { key: "heroSecondaryHref", label: "Ссылка второй кнопки" },
    ],
  },
  {
    label: "Редакционный блок",
    fields: [
      { key: "editorialLabel", label: "Заголовок" },
      { key: "editorialHref", label: "Ссылка" },
      { key: "editorialText", label: "Описание", kind: "textarea" },
    ],
    arrays: [{
      key: "trustItems",
      label: "Короткие факты",
      itemLabel: "Факт",
      fields: [{ key: "title", label: "Значение" }, { key: "text", label: "Подпись" }],
      emptyItem: { title: "", text: "" },
    }],
  },
  {
    label: "Подбор ситуации",
    fields: [
      { key: "situationsEyebrow", label: "Надзаголовок" },
      { key: "situationsTitle", label: "Заголовок" },
      { key: "situationsText", label: "Описание", kind: "textarea" },
    ],
    arrays: [{
      key: "situations",
      label: "Ситуации",
      itemLabel: "Ситуация",
      fields: [
        { key: "icon", label: "Значок", kind: "select", options: iconOptions },
        { key: "title", label: "Название" },
        { key: "text", label: "Описание", kind: "textarea" },
        { key: "href", label: "Ссылка" },
      ],
      emptyItem: { icon: "users", title: "", text: "", href: "/pathways" },
    }],
  },
  {
    label: "Статусы и документы",
    fields: [
      { key: "statusesEyebrow", label: "Надзаголовок" },
      { key: "statusesTitle", label: "Заголовок" },
      { key: "statusesText", label: "Описание", kind: "textarea" },
      { key: "statusPrimary.label", label: "Ярлык главной карточки" },
      { key: "statusPrimary.title", label: "Заголовок главной карточки" },
      { key: "statusPrimary.text", label: "Описание главной карточки", kind: "textarea" },
      { key: "statusPrimary.linkLabel", label: "Текст ссылки главной карточки" },
      { key: "statusPrimary.href", label: "Ссылка главной карточки" },
      { key: "statusLegalLabel", label: "Ярлык правовой карточки" },
      { key: "statusLegalTitle", label: "Заголовок правовой карточки" },
      { key: "statusLegalHref", label: "Ссылка правовой карточки" },
    ],
    arrays: [{
      key: "statusSteps",
      label: "Карточки документов",
      itemLabel: "Карточка",
      fields: [
        { key: "number", label: "Номер" },
        { key: "title", label: "Заголовок" },
        { key: "text", label: "Описание", kind: "textarea" },
        { key: "href", label: "Ссылка" },
      ],
      emptyItem: { number: "", title: "", text: "", href: "/pathways" },
    }],
  },
  {
    label: "Обновления",
    fields: [
      { key: "updatesEyebrow", label: "Надзаголовок" },
      { key: "updatesTitle", label: "Заголовок" },
      { key: "updatesText", label: "Описание", kind: "textarea" },
    ],
    arrays: [{
      key: "updates",
      label: "Новости и изменения",
      itemLabel: "Обновление",
      fields: [
        { key: "date", label: "Дата для показа" },
        { key: "dateTime", label: "Дата в формате ГГГГ-ММ-ДД" },
        { key: "title", label: "Заголовок" },
        { key: "text", label: "Описание", kind: "textarea" },
        { key: "href", label: "Ссылка" },
      ],
      emptyItem: { date: "", dateTime: "", title: "", text: "", href: "/pathways" },
    }],
  },
  {
    label: "Инструменты и проверки",
    fields: [
      { key: "toolsEyebrow", label: "Надзаголовок инструментов" },
      { key: "toolsTitle", label: "Заголовок инструментов" },
      { key: "toolsText", label: "Описание инструментов", kind: "textarea" },
      { key: "checksEyebrow", label: "Надзаголовок проверок" },
      { key: "checksTitle", label: "Заголовок проверок" },
    ],
    arrays: [
      {
        key: "tools",
        label: "Инструменты",
        itemLabel: "Инструмент",
        fields: [
          { key: "icon", label: "Значок", kind: "select", options: iconOptions },
          { key: "diagram", label: "Тип карточки", kind: "select", options: blueprintOptions },
          { key: "label", label: "Короткий ярлык" },
          { key: "title", label: "Заголовок" },
          { key: "text", label: "Описание", kind: "textarea" },
          { key: "href", label: "Ссылка" },
          { key: "featured", label: "Выделенная карточка", kind: "checkbox" },
        ],
        emptyItem: { icon: "compass", diagram: "path", label: "", title: "", text: "", href: "/tools", featured: false },
      },
      {
        key: "checks",
        label: "Проверки документов",
        itemLabel: "Проверка",
        fields: [
          { key: "icon", label: "Значок", kind: "select", options: iconOptions },
          { key: "title", label: "Название" },
          { key: "text", label: "Описание" },
          { key: "href", label: "Ссылка" },
        ],
        emptyItem: { icon: "shield", title: "", text: "", href: "/tools" },
      },
    ],
  },
  {
    label: "Инструкции",
    fields: [
      { key: "guidesEyebrow", label: "Надзаголовок" },
      { key: "featuredGuideTitle", label: "Заголовок главной инструкции" },
      { key: "featuredGuideText", label: "Описание главной инструкции", kind: "textarea" },
      { key: "featuredGuideHref", label: "Ссылка главной инструкции" },
      { key: "guidesLabel", label: "Подпись списка" },
    ],
    arrays: [{
      key: "guides",
      label: "Популярные инструкции",
      itemLabel: "Инструкция",
      fields: [{ key: "title", label: "Заголовок" }, { key: "href", label: "Ссылка" }],
      emptyItem: { title: "", href: "/pathways" },
    }],
  },
  {
    label: "Помощник",
    fields: [
      { key: "helpEyebrow", label: "Надзаголовок" },
      { key: "helpTitle", label: "Заголовок" },
      { key: "helpText", label: "Описание", kind: "textarea" },
      { key: "helpHref", label: "Ссылка" },
      { key: "helpLabel", label: "Текст кнопки" },
    ],
  },
  {
    label: "Вопросы и ответы",
    fields: [
      { key: "faqEyebrow", label: "Надзаголовок" },
      { key: "faqTitle", label: "Заголовок" },
    ],
    arrays: [{
      key: "faqs",
      label: "Вопросы и ответы",
      itemLabel: "Вопрос",
      fields: [{ key: "question", label: "Вопрос" }, { key: "answer", label: "Ответ", kind: "textarea" }],
      emptyItem: { question: "", answer: "" },
    }],
  },
];

function isRecord(value: unknown): value is HomeRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getAtPath(value: unknown, path: readonly PathPart[]): unknown {
  let current = value;
  for (const part of path) {
    if (typeof part === "number") {
      current = Array.isArray(current) ? current[part] : undefined;
    } else {
      current = isRecord(current) ? current[part] : undefined;
    }
  }
  return current;
}

function setAtPath(value: unknown, path: readonly PathPart[], nextValue: unknown): unknown {
  if (path.length === 0) return nextValue;
  const [part, ...remaining] = path;
  if (typeof part === "number") {
    const array = Array.isArray(value) ? value : [];
    const result = [...array];
    result[part] = setAtPath(result[part], remaining, nextValue);
    return result;
  }
  const record = isRecord(value) ? value : {};
  return { ...record, [part]: setAtPath(record[part], remaining, nextValue) };
}

function pathForField(key: string): PathPart[] {
  return key.split(".").map((part) => /^\d+$/.test(part) ? Number(part) : part);
}

function fieldId(path: readonly PathPart[]) {
  return `home-content-${path.join("-")}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

const inputStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  minHeight: "2.5rem",
  padding: "0.55rem 0.7rem",
  border: "1px solid var(--theme-elevation-300)",
  borderRadius: "3px",
  background: "var(--theme-input-bg)",
  color: "var(--theme-text)",
  font: "inherit",
};

const buttonStyle = {
  minHeight: "2.25rem",
  padding: "0.45rem 0.75rem",
  border: "1px solid var(--theme-elevation-300)",
  borderRadius: "3px",
  background: "var(--theme-elevation-50)",
  color: "var(--theme-text)",
  cursor: "pointer",
  font: "inherit",
};

function FieldControl({
  definition,
  path,
  value,
  onChange,
}: {
  definition: FieldDefinition;
  path: readonly PathPart[];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = fieldId(path);
  const kind = definition.kind ?? "text";

  if (kind === "lines") {
    const lines = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    return (
      <fieldset style={{ border: 0, margin: 0, minWidth: 0, padding: 0 }}>
        <legend style={{ marginBottom: "0.35rem" }}>{definition.label}</legend>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {lines.map((line, index) => (
            <div key={`${id}-${index}`} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                aria-label={`${definition.label}, строка ${index + 1}`}
                style={inputStyle}
                value={line}
                onChange={(event) => {
                  const next = [...lines];
                  next[index] = event.target.value;
                  onChange(next);
                }}
              />
              <button
                type="button"
                aria-label={`Удалить строку ${index + 1}`}
                style={buttonStyle}
                onClick={() => onChange(lines.filter((_, rowIndex) => rowIndex !== index))}
              >
                Удалить
              </button>
            </div>
          ))}
          <div>
            <button type="button" style={buttonStyle} onClick={() => onChange([...lines, ""])}>Добавить строку</button>
          </div>
        </div>
      </fieldset>
    );
  }

  if (kind === "checkbox") {
    return (
      <label htmlFor={id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", minHeight: "2.5rem" }}>
        <input id={id} type="checkbox" checked={value === true} onChange={(event) => onChange(event.target.checked)} />
        {definition.label}
      </label>
    );
  }

  return (
    <label htmlFor={id} style={{ display: "grid", gap: "0.35rem" }}>
      <span>{definition.label}</span>
      {kind === "select" ? (
        <select
          id={id}
          style={inputStyle}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        >
          {definition.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : kind === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          style={{ ...inputStyle, minHeight: "5rem", resize: "vertical" }}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          style={inputStyle}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export const HomeContentField: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<unknown>({ path });
  const current: HomeRecord = {
    ...DEFAULT_HOME_CONTENT,
    ...(isRecord(value) ? value : {}),
  };

  function update(pathParts: readonly PathPart[], nextValue: unknown) {
    setValue(setAtPath(current, pathParts, nextValue));
  }

  return (
    <div style={{ display: "grid", gap: "0.8rem" }}>
      <div style={{ border: "1px solid var(--theme-elevation-200)", borderRadius: "4px", padding: "0.85rem 1rem" }}>
        <strong>Редактирование главной страницы</strong>
        <p style={{ margin: "0.35rem 0 0", color: "var(--theme-elevation-700)" }}>
          Откройте нужный раздел. Карточки и ссылки можно добавлять и удалять; данные сохраняются в прежнем формате и показываются в предпросмотре.
        </p>
      </div>

      {sections.map((section) => (
        <details key={section.label} style={{ border: "1px solid var(--theme-elevation-200)", borderRadius: "4px", padding: "0.75rem 1rem" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>{section.label}</summary>
          <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            {section.fields?.length ? (
              <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
                {section.fields.map((definition) => {
                  const pathParts = pathForField(definition.key);
                  return (
                    <FieldControl
                      key={definition.key}
                      definition={definition}
                      path={pathParts}
                      value={getAtPath(current, pathParts)}
                      onChange={(nextValue) => update(pathParts, nextValue)}
                    />
                  );
                })}
              </div>
            ) : null}

            {section.arrays?.map((arrayDefinition) => {
              const items = Array.isArray(current[arrayDefinition.key]) ? current[arrayDefinition.key] as unknown[] : [];
              return (
                <section key={arrayDefinition.key} style={{ display: "grid", gap: "0.65rem" }} aria-label={arrayDefinition.label}>
                  <h4 style={{ margin: 0 }}>{arrayDefinition.label} <span style={{ color: "var(--theme-elevation-600)", fontWeight: 400 }}>({items.length})</span></h4>
                  {items.map((item, index) => (
                    <details key={`${arrayDefinition.key}-${index}`} style={{ border: "1px solid var(--theme-elevation-150)", borderRadius: "4px", padding: "0.65rem 0.8rem" }}>
                      <summary style={{ cursor: "pointer", fontWeight: 600 }}>{arrayDefinition.itemLabel} {index + 1}</summary>
                      <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.8rem" }}>
                        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                          {arrayDefinition.fields.map((definition) => {
                            const pathParts: PathPart[] = [arrayDefinition.key, index, ...pathForField(definition.key)];
                            return (
                              <FieldControl
                                key={definition.key}
                                definition={definition}
                                path={pathParts}
                                value={getAtPath(current, pathParts)}
                                onChange={(nextValue) => update(pathParts, nextValue)}
                              />
                            );
                          })}
                        </div>
                        <div>
                          <button
                            type="button"
                            style={buttonStyle}
                            aria-label={`Удалить: ${arrayDefinition.itemLabel.toLowerCase()} ${index + 1}`}
                            onClick={() => update([arrayDefinition.key], items.filter((_, itemIndex) => itemIndex !== index))}
                          >
                            Удалить {arrayDefinition.itemLabel.toLowerCase()}
                          </button>
                        </div>
                      </div>
                    </details>
                  ))}
                  <div>
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => update([arrayDefinition.key], [...items, { ...arrayDefinition.emptyItem }])}
                    >
                      Добавить: {arrayDefinition.itemLabel.toLowerCase()}
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
};

