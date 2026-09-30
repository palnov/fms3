"use client";

import { useField, useFormFields } from "@payloadcms/ui";
import type { JSONFieldClientComponent } from "payload";
import { useEffect, useId, useState } from "react";
import type { Condition, InputValue } from "@/lib/no-code-runtime/types";
import styles from "./ToolEditors.module.css";

type RecordValue = Record<string, unknown>;
type FormFieldState = { value?: unknown; rows?: unknown[] };
type ToolFieldOption = {
  value: string;
  label: string;
  type?: string;
  options?: Array<{ value: string; label: string }>;
};
type SelectOption = { value: string; label: string };

const CONDITION_OPERATORS: Array<SelectOption> = [
  { value: "always", label: "Всегда" },
  { value: "equals", label: "Равно" },
  { value: "notEquals", label: "Не равно" },
  { value: "contains", label: "Содержит" },
  { value: "greaterThan", label: "Больше" },
  { value: "greaterThanOrEqual", label: "Не меньше" },
  { value: "lessThan", label: "Меньше" },
  { value: "lessThanOrEqual", label: "Не больше" },
  { value: "before", label: "Раньше даты" },
  { value: "after", label: "Позже даты" },
  { value: "exists", label: "Заполнено" },
  { value: "in", label: "Входит в список" },
  { value: "notIn", label: "Не входит в список" },
  { value: "and", label: "Все условия выполнены" },
  { value: "or", label: "Хотя бы одно условие выполнено" },
  { value: "not", label: "Условие не выполнено" },
];

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function useFormValue(path: string): unknown {
  return useFormFields(([formFields]) => {
    const fields = formFields as unknown as Record<string, FormFieldState | undefined>;
    return fields[path]?.value;
  });
}

function assignPath(target: RecordValue, parts: string[], value: unknown) {
  let current: unknown = target;
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const isLast = index === parts.length - 1;
    const isIndex = /^\d+$/.test(part);
    const nextIsIndex = /^\d+$/.test(parts[index + 1] ?? "");

    if (Array.isArray(current)) {
      const arrayIndex = Number(part);
      if (isLast) {
        current[arrayIndex] = value;
        return;
      }
      if (!current[arrayIndex] || typeof current[arrayIndex] !== "object") {
        current[arrayIndex] = nextIsIndex ? [] : {};
      }
      current = current[arrayIndex];
      continue;
    }

    if (!isRecord(current)) return;
    if (isLast) {
      current[part] = value;
      return;
    }
    if (!current[part] || typeof current[part] !== "object") {
      current[part] = isIndex ? [] : nextIsIndex ? [] : {};
    }
    current = current[part];
  }
}

function readArrayRecords(fields: Record<string, FormFieldState | undefined>, path: string): RecordValue[] {
  const directValue = fields[path]?.value;
  if (Array.isArray(directValue)) return directValue.filter(isRecord);

  const prefix = path + ".";
  const rows = new Map<number, RecordValue>();
  const rowCount = fields[path]?.rows?.length ?? 0;
  for (let index = 0; index < rowCount; index += 1) rows.set(index, {});

  for (const [fieldPath, state] of Object.entries(fields)) {
    if (!fieldPath.startsWith(prefix)) continue;
    const [rowIndexText, ...parts] = fieldPath.slice(prefix.length).split(".");
    if (!/^\d+$/.test(rowIndexText) || parts.length === 0) continue;
    const index = Number(rowIndexText);
    const row = rows.get(index) ?? {};
    assignPath(row, parts, state?.value);
    rows.set(index, row);
  }

  return [...rows.entries()].sort(([left], [right]) => left - right).map(([, row]) => row);
}

function useFormArrayValue(path: string): RecordValue[] {
  return useFormFields(([formFields]) => {
    const fields = formFields as unknown as Record<string, FormFieldState | undefined>;
    return readArrayRecords(fields, path);
  });
}

function normalizeFieldOptions(value: unknown): ToolFieldOption[] {
  return asArray(value).flatMap((item) => {
    if (!isRecord(item) || typeof item.key !== "string" || !item.key) return [];
    const options = asArray(item.options).flatMap((option) => {
      if (!isRecord(option) || typeof option.value !== "string") return [];
      return [{
        value: option.value,
        label: typeof option.label === "string" && option.label ? option.label : option.value,
      }];
    });
    const title = typeof item.label === "string" && item.label ? item.label : item.key;
    return [{
      value: item.key,
      label: title + " · " + item.key,
      type: typeof item.type === "string" ? item.type : undefined,
      options,
    }];
  });
}

function normalizeFormulaOptions(value: unknown): ToolFieldOption[] {
  return asArray(value).flatMap((item) => {
    if (!isRecord(item) || typeof item.key !== "string" || !item.key) return [];
    const title = typeof item.label === "string" && item.label ? item.label : item.key;
    const kind = typeof item.kind === "string" ? item.kind : "";
    const type = ["add", "subtract", "multiply", "divide", "percent", "round", "min", "max", "dateDiffDays", "normalizeNumber"].includes(kind)
      ? "number"
      : kind === "dateAddDays"
        ? "date"
        : "formula";
    return [{ value: item.key, label: title + " · формула " + item.key, type }];
  });
}

function useToolChoices(includeFormulas = false): ToolFieldOption[] {
  const fieldOptions = normalizeFieldOptions(useFormArrayValue("fields"));
  const formulas = useFormArrayValue("formulas");
  return includeFormulas ? [...fieldOptions, ...normalizeFormulaOptions(formulas)] : fieldOptions;
}

function isCondition(value: unknown): value is Condition {
  if (!isRecord(value) || typeof value.operator !== "string") return false;
  if (!CONDITION_OPERATORS.some((option) => option.value === value.operator)) return false;
  if (value.operator === "always") return true;
  if (value.operator === "and" || value.operator === "or") return Array.isArray(value.conditions);
  if (value.operator === "not") return "condition" in value;
  if (typeof value.field !== "string") return false;
  if (value.operator === "in" || value.operator === "notIn") return Array.isArray(value.values);
  return true;
}

function fieldOption(value: string, options: ToolFieldOption[]) {
  return options.find((option) => option.value === value);
}

function defaultValueForField(field?: ToolFieldOption): InputValue {
  if (field?.type === "checkbox") return false;
  if (field?.type === "multiSelect") return [];
  if (field?.type === "number" || field?.type === "currency") return 0;
  return "";
}

function parseNumericInput(value: string): InputValue {
  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
  if (!normalized) return "";
  const number = Number(normalized);
  return Number.isFinite(number) ? number : value;
}

function makeCondition(operator: string, field: string): Condition {
  if (operator === "always") return { operator: "always" };
  if (operator === "and" || operator === "or") return { operator, conditions: [] };
  if (operator === "not") return { operator: "not", condition: { operator: "always" } };
  if (operator === "exists") return { operator: "exists", field };
  if (operator === "in" || operator === "notIn") {
    return { operator, field, values: [] };
  }
  const comparisonOperator = operator as
    | "equals"
    | "notEquals"
    | "contains"
    | "greaterThan"
    | "greaterThanOrEqual"
    | "lessThan"
    | "lessThanOrEqual"
    | "before"
    | "after";
  return {
    operator: comparisonOperator,
    field,
    value: "",
  };
}

type InputValueControlProps = {
  value: InputValue;
  onChange: (value: InputValue) => void;
  field?: ToolFieldOption;
  label: string;
};

function NumberInput({
  value,
  label,
  onCommit,
}: {
  value: InputValue;
  label: string;
  onCommit: (value: string) => void;
}) {
  const current = typeof value === "number" || typeof value === "string" ? String(value) : "";
  const [draft, setDraft] = useState({ source: current, value: current });
  const displayValue = draft.source === current ? draft.value : current;

  return (
    <input
      className={styles.input}
      type="text"
      inputMode="decimal"
      aria-label={label}
      value={displayValue}
      onChange={(event) => setDraft({ source: current, value: event.target.value })}
      onBlur={() => {
        if (displayValue !== current) onCommit(displayValue);
      }}
    />
  );
}

function InputValueControl({ value, onChange, field, label }: InputValueControlProps) {
  if (field?.type === "checkbox" || typeof value === "boolean") {
    return (
      <label className={styles.control}>
        <span>{label}</span>
        <select
          className={styles.input}
          value={value === true ? "true" : value === false ? "false" : "null"}
          onChange={(event) => onChange(event.target.value === "null" ? null : event.target.value === "true")}
        >
          <option value="null">Не задано</option>
          <option value="true">Да</option>
          <option value="false">Нет</option>
        </select>
      </label>
    );
  }

  if (field?.type === "multiSelect" || Array.isArray(value)) {
    const selected = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    const options = [...(field?.options ?? [])];
    for (const item of selected) {
      if (!options.some((option) => option.value === item)) options.push({ value: item, label: item + " · текущее значение" });
    }
    if (options.length === 0) {
      return (
        <label className={styles.control}>
          <span>{label} · по одному значению на строку</span>
          <textarea
            className={styles.input}
            rows={3}
            value={selected.join("\n")}
            onChange={(event) => onChange(event.target.value.split("\n").filter(Boolean))}
          />
        </label>
      );
    }
    return (
      <fieldset className={styles.choiceGroup}>
        <legend>{label}</legend>
        {options.map((option) => (
          <label className={styles.choice} key={option.value}>
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={(event) => onChange(event.target.checked
                ? [...selected, option.value]
                : selected.filter((item) => item !== option.value))}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (field?.options?.length && (field.type === "select" || field.type === "radio")) {
    const currentValue = value === null ? "__null" : String(value);
    const isKnown = field.options.some((option) => option.value === currentValue);
    return (
      <label className={styles.control}>
        <span>{label}</span>
        <select
          className={styles.input}
          value={currentValue}
          onChange={(event) => onChange(event.target.value === "__null" ? null : event.target.value)}
        >
          {value === null ? <option value="__null">Пустое значение</option> : null}
          {!isKnown && value !== null ? <option value={currentValue}>{String(value)} · текущее значение</option> : null}
          {field.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </label>
    );
  }

  if (value === null) {
    return (
      <label className={styles.control}>
        <span>{label}</span>
        <select className={styles.input} value="null" onChange={(event) => onChange(event.target.value === "null" ? null : "")}>
          <option value="null">Пустое значение</option>
          <option value="text">Текст</option>
        </select>
      </label>
    );
  }

  const numeric = field?.type === "number" || field?.type === "currency" || typeof value === "number";
  const date = field?.type === "date";
  if (numeric) {
    return (
      <label className={styles.control}>
        <span>{label}</span>
        <NumberInput
          value={value}
          label={label}
          onCommit={(rawValue) => onChange(parseNumericInput(rawValue))}
        />
      </label>
    );
  }
  return (
    <label className={styles.control}>
      <span>{label}</span>
      <input
        className={styles.input}
        type={date ? "date" : "text"}
        value={String(value)}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </label>
  );
}

type ConditionNodeProps = {
  value: unknown;
  choices: ToolFieldOption[];
  depth: number;
  onChange: (value: Condition) => void;
};

function ConditionNode({ value, choices, depth, onChange }: ConditionNodeProps) {
  if (depth > 6) {
    return <div className={styles.warning}>Условие вложено слишком глубоко. Упростите его, чтобы продолжить редактирование.</div>;
  }
  if (!isCondition(value)) {
    return (
      <div className={styles.warning}>
        <p>Сохранённое условие не соответствует текущему формату. Оно не изменится, пока вы не нажмёте кнопку ниже.</p>
        <button className={styles.button} type="button" onClick={() => onChange({ operator: "always" })}>Заменить на «Всегда»</button>
      </div>
    );
  }

  const condition = value;
  const operator = condition.operator;
  const selectedField = "field" in condition ? fieldOption(condition.field, choices) : undefined;
  const currentField = "field" in condition ? condition.field : "";

  function changeOperator(nextOperator: string) {
    onChange(makeCondition(nextOperator, currentField));
  }

  function changeField(nextField: string) {
    if ("field" in condition) onChange({ ...condition, field: nextField });
  }

  return (
    <div className={depth > 0 ? styles.nestedCondition : styles.condition}>
      <div className={styles.conditionHeader}>
        <label className={styles.control}>
          <span>Проверка</span>
          <select className={styles.input} value={operator} onChange={(event) => changeOperator(event.target.value)}>
            {CONDITION_OPERATORS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
        </label>
        {"field" in condition ? (
          <label className={styles.control}>
            <span>Поле инструмента</span>
            <select className={styles.input} value={condition.field} onChange={(event) => changeField(event.target.value)}>
              <option value="">Выберите поле</option>
              {!choices.some((item) => item.value === condition.field) && condition.field
                ? <option value={condition.field}>Не найдено: {condition.field}</option>
                : null}
              {choices.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      {"value" in condition ? (
        <InputValueControl
          label="Значение для сравнения"
          value={condition.value ?? ""}
          field={selectedField}
          onChange={(nextValue) => onChange({ ...condition, value: nextValue })}
        />
      ) : null}

      {operator === "in" || operator === "notIn" ? (
        <div className={styles.valueList}>
          <strong>Допустимые значения</strong>
          {condition.values.map((item, index) => (
            <div className={styles.valueRow} key={index}>
              <InputValueControl
                label={"Значение " + (index + 1)}
                value={item}
                field={selectedField}
                onChange={(nextValue) => onChange({ ...condition, values: condition.values.map((entry, itemIndex) => itemIndex === index ? nextValue : entry) })}
              />
              <button className={styles.button} type="button" onClick={() => onChange({ ...condition, values: condition.values.filter((_, itemIndex) => itemIndex !== index) })}>Удалить</button>
            </div>
          ))}
          <button className={styles.button} type="button" onClick={() => onChange({ ...condition, values: [...condition.values, defaultValueForField(selectedField)] })}>Добавить значение</button>
        </div>
      ) : null}

      {operator === "and" || operator === "or" ? (
        <div className={styles.valueList}>
          <strong>Вложенные условия</strong>
          {condition.conditions.map((item, index) => (
            <div className={styles.valueRow} key={index}>
              <ConditionNode
                value={item}
                choices={choices}
                depth={depth + 1}
                onChange={(nextValue) => onChange({ ...condition, conditions: condition.conditions.map((entry, itemIndex) => itemIndex === index ? nextValue : entry) })}
              />
              <button className={styles.button} type="button" onClick={() => onChange({ ...condition, conditions: condition.conditions.filter((_, itemIndex) => itemIndex !== index) })}>Удалить условие</button>
            </div>
          ))}
          {depth < 5 && choices.length > 0 ? (
            <button className={styles.button} type="button" onClick={() => onChange({
              ...condition,
              conditions: [...condition.conditions, makeCondition("equals", choices[0]?.value ?? "")],
            })}>Добавить условие</button>
          ) : depth < 5 ? (
            <p className={styles.hint}>Добавьте поле формы или формулу, чтобы создать вложенное условие.</p>
          ) : <p className={styles.hint}>Достигнута максимальная глубина вложенности.</p>}
        </div>
      ) : null}

      {operator === "not" ? (
        <div className={styles.valueList}>
          <strong>Условие для инверсии</strong>
          <ConditionNode
            value={condition.condition}
            choices={choices}
            depth={depth + 1}
            onChange={(nextValue) => onChange({ ...condition, condition: nextValue })}
          />
        </div>
      ) : null}
    </div>
  );
}

export const ConditionEditor: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<unknown>({ path });
  const choices = useToolChoices(true);

  return (
    <div className={styles.editor}>
      <p className={styles.hint}>Соберите правило из полей формы и формул. Изменения сохраняются в прежнем формате условий.</p>
      <ConditionNode
        value={value === undefined || value === null ? { operator: "always" } : value}
        choices={choices}
        depth={0}
        onChange={setValue}
      />
    </div>
  );
};

function normalizeMap(value: unknown): Record<string, string> | null {
  if (value === undefined || value === null) return {};
  if (!isRecord(value)) return null;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, typeof entry === "string" ? entry : String(entry ?? "")]));
}

type StringMappingRowProps = {
  entryKey: string;
  entryValue: string;
  keyLabel: string;
  suggestionListId?: string;
  valueOptions: SelectOption[];
  valueLabel: string;
  onRename: (nextKey: string) => void;
  onChangeValue: (nextValue: string) => void;
  onRemove: () => void;
};

function StringMappingRow({
  entryKey,
  entryValue,
  keyLabel,
  suggestionListId,
  valueOptions,
  valueLabel,
  onRename,
  onChangeValue,
  onRemove,
}: StringMappingRowProps) {
  const [draft, setDraft] = useState({ source: entryKey, value: entryKey });
  const draftKey = draft.source === entryKey ? draft.value : entryKey;

  return (
    <div className={styles.mappingRow}>
      <label className={styles.control}>
        <span>{keyLabel}</span>
        <input
          className={styles.input}
          list={suggestionListId}
          value={draftKey}
          onChange={(event) => setDraft({ source: entryKey, value: event.target.value })}
          onBlur={() => {
            const nextKey = draftKey.trim();
            if (nextKey && nextKey !== entryKey) onRename(nextKey);
            setDraft({ source: entryKey, value: entryKey });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
      </label>
      <label className={styles.control}>
        <span>{valueLabel}</span>
        <select className={styles.input} value={entryValue} onChange={(event) => onChangeValue(event.target.value)}>
          {!valueOptions.some((option) => option.value === entryValue)
            ? <option value={entryValue}>{entryValue ? "Не найдено: " + entryValue : "Выберите значение"}</option>
            : null}
          {valueOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <button className={styles.button} type="button" onClick={onRemove}>Удалить</button>
    </div>
  );
}

type StringMappingEditorProps = { path: string; mode: "request" | "response" };

function StringMappingEditor({ path, mode }: StringMappingEditorProps) {
  const { value, setValue } = useField<unknown>({ path });
  const fieldOptions = useToolChoices(false);
  const formulaOptions = normalizeFormulaOptions(useFormArrayValue("formulas"));
  const resultTargets: SelectOption[] = [
    { value: "result.key", label: "Результат · ключ" },
    { value: "result.status", label: "Результат · статус" },
    { value: "result.title", label: "Результат · заголовок" },
    { value: "result.body", label: "Результат · текст" },
    { value: "result.ctaLabel", label: "Результат · подпись кнопки" },
    { value: "result.ctaHref", label: "Результат · ссылка кнопки" },
  ];
  const valueTargets: SelectOption[] = [
    ...fieldOptions.map((option) => ({ value: option.value, label: "Значение · " + option.label })),
    ...formulaOptions.map((option) => ({ value: option.value, label: "Значение · " + option.label })),
  ];
  const responseTargets = [...resultTargets, ...valueTargets];
  const responseSources = [
    ...resultTargets,
    ...fieldOptions.map((option) => ({ value: "values." + option.value, label: "Ответ адаптера · " + option.label })),
    ...formulaOptions.map((option) => ({ value: "values." + option.value, label: "Ответ адаптера · " + option.label })),
  ];
  const suggestionListId = useId();
  const mapping = normalizeMap(value);

  if (mapping === null) {
    return (
      <div className={styles.editor}>
        <div className={styles.warning}>Данные маппинга имеют неподдерживаемую структуру и не меняются автоматически.</div>
        <button className={styles.button} type="button" onClick={() => setValue({})}>Заменить пустым маппингом</button>
      </div>
    );
  }
  const currentMapping = mapping;

  const valueOptions = mode === "request"
    ? fieldOptions.map((option) => ({ value: option.value, label: option.label }))
    : responseSources;
  const title = mode === "request" ? "Передача ответов адаптеру" : "Обработка результата адаптера";

  function update(next: Record<string, string>) {
    setValue(next);
  }

  function renameKey(oldKey: string, nextKey: string) {
    if (Object.prototype.hasOwnProperty.call(currentMapping, nextKey)) return;
    const next: Record<string, string> = {};
    for (const [key, entry] of Object.entries(currentMapping)) next[key === oldKey ? nextKey : key] = entry;
    update(next);
  }

  function addRow() {
    let index = 1;
    let key = mode === "request"
      ? "field" + index
      : !Object.prototype.hasOwnProperty.call(currentMapping, "result.body")
        ? "result.body"
        : "externalField" + index;
    while (Object.prototype.hasOwnProperty.call(currentMapping, key)) {
      index += 1;
      key = mode === "request" ? "field" + index : "externalField" + index;
    }
    const defaultSource = mode === "response"
      ? responseSources.find((option) => option.value === "result.title")?.value ?? responseSources[0]?.value ?? ""
      : valueOptions[0]?.value ?? "";
    update({ ...currentMapping, [key]: defaultSource });
  }

  return (
    <div className={styles.editor}>
      <p className={styles.hint}>
        {mode === "request"
          ? "Слева укажите имя параметра адаптера (латинские буквы, цифры, точка, дефис или подчёркивание). Справа выберите поле формы, из которого взять значение."
          : "Слева укажите, куда записать результат адаптера; справа выберите источник из его результата. Подсказки в списке можно дополнить своим ключом."}
      </p>
      <strong>{title}</strong>
      {mode === "response" ? (
        <datalist id={suggestionListId}>
          {responseTargets.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </datalist>
      ) : null}
      {Object.entries(currentMapping).map(([key, entry]) => (
        <StringMappingRow
          key={key}
          entryKey={key}
          entryValue={entry}
          keyLabel={mode === "request" ? "Параметр адаптера" : "Куда записать"}
          suggestionListId={mode === "response" ? suggestionListId : undefined}
          valueOptions={valueOptions}
          valueLabel={mode === "request" ? "Поле формы" : "Источник ответа"}
          onRename={(nextKey) => renameKey(key, nextKey)}
          onChangeValue={(nextValue) => update({ ...currentMapping, [key]: nextValue })}
          onRemove={() => {
            const next = { ...currentMapping };
            delete next[key];
            update(next);
          }}
        />
      ))}
      <button className={styles.button} type="button" onClick={addRow}>Добавить сопоставление</button>
    </div>
  );
}

export const RequestMappingEditor: JSONFieldClientComponent = ({ path }) => (
  <StringMappingEditor path={path} mode="request" />
);

export const ResponseMappingEditor: JSONFieldClientComponent = ({ path }) => (
  <StringMappingEditor path={path} mode="response" />
);

function relationshipId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!isRecord(value)) return null;
  const candidate = value.id ?? value.value;
  if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
  if (isRecord(candidate)) return relationshipId(candidate);
  return null;
}

type RelatedToolSchema = {
  id: string;
  status: "loading" | "ready" | "error";
  fields: ToolFieldOption[];
  formulas: ToolFieldOption[];
};

function useRelatedToolSchema(): { toolId: string | null; schema: RelatedToolSchema | null } {
  const toolId = relationshipId(useFormValue("tool"));
  const [loaded, setLoaded] = useState<RelatedToolSchema | null>(null);

  useEffect(() => {
    if (!toolId) return;
    const controller = new AbortController();
    fetch("/api/tools/" + encodeURIComponent(toolId) + "?depth=0&draft=true", {
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Tool schema request failed");
        const document: unknown = await response.json();
        if (!isRecord(document)) throw new Error("Tool schema is invalid");
        setLoaded({
          id: toolId,
          status: "ready",
          fields: normalizeFieldOptions(document.fields),
          formulas: normalizeFormulaOptions(document.formulas),
        });
      })
      .catch((error: unknown) => {
        if (isRecord(error) && error.name === "AbortError") return;
        setLoaded({ id: toolId, status: "error", fields: [], formulas: [] });
      });
    return () => controller.abort();
  }, [toolId]);

  if (!toolId) return { toolId: null, schema: null };
  if (loaded?.id === toolId) return { toolId, schema: loaded };
  return { toolId, schema: { id: toolId, status: "loading", fields: [], formulas: [] } };
}

type ValueMapEditorProps = { path: string; mode: "answers" | "expected" };

function ValueMapEditor({ path, mode }: ValueMapEditorProps) {
  const { value, setValue } = useField<unknown>({ path });
  const { toolId, schema } = useRelatedToolSchema();
  const values = isRecord(value) ? value : null;
  const keyOptions = mode === "answers" ? schema?.fields ?? [] : schema?.formulas ?? [];
  const displayOptions = [...keyOptions];

  if (values) {
    for (const key of Object.keys(values)) {
      if (!displayOptions.some((option) => option.value === key)) {
        displayOptions.push({ value: key, label: key + " · нет в выбранной модели" });
      }
    }
  }

  if (!values) {
    return (
      <div className={styles.editor}>
        <div className={styles.warning}>Сохранённые данные имеют неподдерживаемую структуру. Они останутся нетронутыми.</div>
        <button className={styles.button} type="button" onClick={() => setValue({})}>Начать с пустого списка</button>
      </div>
    );
  }
  const currentValues = values;

  const entries = Object.entries(currentValues);

  function addEntry() {
    const unused = keyOptions.find((option) => !Object.prototype.hasOwnProperty.call(currentValues, option.value));
    if (!unused) return;
    setValue({ ...currentValues, [unused.value]: defaultValueForField(unused) });
  }

  function changeKey(oldKey: string, nextKey: string) {
    if (oldKey === nextKey || Object.prototype.hasOwnProperty.call(currentValues, nextKey)) return;
    const next: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(currentValues)) next[key === oldKey ? nextKey : key] = entry;
    setValue(next);
  }

  const loadingText = !toolId
    ? "Сначала выберите инструмент в поле выше."
    : schema?.status === "loading"
      ? "Загружаю поля и формулы выбранного инструмента…"
      : schema?.status === "error"
        ? "Не удалось загрузить модель инструмента. Существующие значения можно сохранить или удалить."
        : "";

  return (
    <div className={styles.editor}>
      {loadingText ? <p className={styles.hint} role="status">{loadingText}</p> : null}
      {mode === "answers"
        ? <p className={styles.hint}>Выберите поле инструмента и задайте пример ответа. Тип значения подбирается по типу поля.</p>
        : <p className={styles.hint}>Выберите вычисляемый результат и ожидаемое значение для проверки правила.</p>}
      {entries.map(([key, entry]) => {
        const definition = keyOptions.find((option) => option.value === key);
        const inputValue = entry as InputValue;
        const valueControl = (
          <InputValueControl
            label={mode === "answers" ? "Ответ" : "Ожидаемое значение"}
            value={inputValue}
            field={definition}
            onChange={(nextValue) => setValue({ ...currentValues, [key]: nextValue })}
          />
        );
        return (
          <div className={styles.mappingRow} key={key}>
            {keyOptions.length > 0 ? (
              <label className={styles.control}>
                <span>{mode === "answers" ? "Поле формы" : "Результат формулы"}</span>
                <select className={styles.input} value={key} onChange={(event) => changeKey(key, event.target.value)}>
                  {displayOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                </select>
              </label>
            ) : (
              <label className={styles.control}>
                <span>{mode === "answers" ? "Ключ поля" : "Ключ результата"}</span>
                <input className={styles.input} value={key} readOnly />
              </label>
            )}
            {valueControl}
            <button
              className={styles.button}
              type="button"
              onClick={() => {
                const next = { ...currentValues };
                delete next[key];
                setValue(next);
              }}
            >Удалить</button>
          </div>
        );
      })}
      {keyOptions.length > 0 ? (
        <button className={styles.button} type="button" onClick={addEntry} disabled={!keyOptions.some((option) => !Object.prototype.hasOwnProperty.call(currentValues, option.value))}>
          Добавить значение
        </button>
      ) : null}
    </div>
  );
}

export const RuleAnswersEditor: JSONFieldClientComponent = ({ path }) => (
  <ValueMapEditor path={path} mode="answers" />
);

export const RuleExpectedValuesEditor: JSONFieldClientComponent = ({ path }) => (
  <ValueMapEditor path={path} mode="expected" />
);

type DataColumn = { key: string; label: string; type: string };

function normalizeColumns(value: unknown): DataColumn[] {
  return asArray(value).flatMap((item) => {
    if (!isRecord(item) || typeof item.key !== "string" || !item.key) return [];
    return [{
      key: item.key,
      label: typeof item.label === "string" && item.label ? item.label : item.key,
      type: typeof item.type === "string" ? item.type : "text",
    }];
  });
}

export const DataTableValuesEditor: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<unknown>({ path });
  const columns = normalizeColumns(useFormArrayValue("columns"));
  const values = isRecord(value) ? value : null;
  const unknownKeys = values ? Object.keys(values).filter((key) => !columns.some((column) => column.key === key)) : [];

  if (!values) {
    return (
      <div className={styles.editor}>
        <div className={styles.warning}>Значения строки имеют неподдерживаемую структуру и останутся нетронутыми.</div>
        <button className={styles.button} type="button" onClick={() => setValue({})}>Заменить пустой таблицей значений</button>
      </div>
    );
  }

  function changeCell(column: DataColumn, rawValue: string) {
    const next = { ...values };
    if (rawValue === "" && (column.type === "number" || column.type === "currency")) {
      delete next[column.key];
    } else {
      next[column.key] = column.type === "number" || column.type === "currency"
        ? parseNumericInput(rawValue)
        : rawValue;
    }
    setValue(next);
  }

  return (
    <div className={styles.editor}>
      <p className={styles.hint}>Заполните значения в колонках таблицы. Период действия строки и источник редактируются отдельно.</p>
      {columns.length === 0 ? (
        <p className={styles.warning}>Сначала добавьте колонки выше. Текущие значения будут сохранены.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>{columns.map((column) => <th key={column.key}>{column.label}<small>{column.key} · {column.type}</small></th>)}</tr>
            </thead>
            <tbody>
              <tr>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.type === "number" || column.type === "currency" ? (
                      <NumberInput
                        value={values[column.key] === undefined ? "" : values[column.key] as InputValue}
                        label={column.label}
                        onCommit={(rawValue) => changeCell(column, rawValue)}
                      />
                    ) : (
                      <input
                        className={styles.input}
                        type={column.type === "date" ? "date" : "text"}
                        value={values[column.key] === undefined || values[column.key] === null ? "" : String(values[column.key])}
                        onChange={(event) => changeCell(column, event.target.value)}
                        aria-label={column.label}
                      />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {unknownKeys.length > 0 ? (
        <div className={styles.warning}>
          Значения для отсутствующих колонок сохранены: {unknownKeys.join(", ")}. Добавьте колонку с таким ключом, чтобы изменить их.
        </div>
      ) : null}
    </div>
  );
};
