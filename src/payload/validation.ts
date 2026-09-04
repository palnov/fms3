import type { CollectionBeforeValidateHook } from "payload";
import { hasProviderAdapter } from "@/lib/tools/provider-adapters";

const KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const CONDITION_OPERATORS = new Set([
  "always",
  "equals",
  "notEquals",
  "contains",
  "exists",
  "in",
  "notIn",
  "greaterThan",
  "greaterThanOrEqual",
  "lessThan",
  "lessThanOrEqual",
  "before",
  "after",
  "and",
  "or",
  "not",
]);
const FORMULA_KINDS = new Set([
  "add",
  "subtract",
  "multiply",
  "divide",
  "percent",
  "round",
  "min",
  "max",
  "dateDiffDays",
  "dateAddDays",
  "lookup",
  "conditional",
  "normalizeNumber",
]);

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function assertKey(value: unknown, label: string) {
  const key = text(value);
  if (!KEY_PATTERN.test(key)) throw new Error(`${label}: используйте латинский ключ без пробелов (до 64 символов).`);
}

function assertUnique(items: unknown[], field: string, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const value = asRecord(item)?.[field];
    const key = text(value);
    if (!key) throw new Error(`${label}: поле «${field}» обязательно.`);
    if (seen.has(key)) throw new Error(`${label}: ключ «${key}» повторяется.`);
    seen.add(key);
  }
}

function assertPublicPath(value: unknown, label: string, prefix?: string) {
  const pathname = text(value);
  if (!pathname.startsWith("/") || pathname.includes("\\") || pathname.includes("//") || pathname.includes("?") || pathname.includes("#") || pathname.split("/").includes("..")) {
    throw new Error(`${label}: укажите безопасный публичный путь, например /pathways/vnzh.`);
  }
  if (pathname !== "/" && (pathname === "/api" || pathname.startsWith("/api/") || pathname === "/cms" || pathname.startsWith("/cms/") || pathname === "/admin" || pathname.startsWith("/admin/"))) {
    throw new Error(`${label}: системные пути /api, /cms и /admin зарезервированы.`);
  }
  if (prefix && !pathname.startsWith(prefix)) throw new Error(`${label}: путь должен начинаться с ${prefix}.`);
}

function isSafeHref(value: unknown) {
  const href = text(value);
  return href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https:\/\//i.test(href);
}

function assertHref(value: unknown, label: string) {
  if (!isSafeHref(value)) throw new Error(`${label}: разрешены только внутренние ссылки, https, mailto или tel.`);
}

function validateCondition(value: unknown, label: string, depth = 0): void {
  if (depth > 12) throw new Error(`${label}: условие слишком глубоко вложено.`);
  const condition = asRecord(value);
  if (!condition) throw new Error(`${label}: укажите JSON-условие.`);
  const operator = text(condition.operator);
  if (!CONDITION_OPERATORS.has(operator)) throw new Error(`${label}: неизвестный оператор «${operator}».`);

  if (["equals", "notEquals", "contains", "greaterThan", "greaterThanOrEqual", "lessThan", "lessThanOrEqual", "before", "after", "exists", "in", "notIn"].includes(operator)) {
    assertKey(condition.field, `${label}.field`);
  }
  if (["in", "notIn"].includes(operator) && !Array.isArray(condition.values)) throw new Error(`${label}: values должен быть массивом.`);
  if (["and", "or"].includes(operator)) {
    if (!Array.isArray(condition.conditions) || condition.conditions.length === 0) throw new Error(`${label}: conditions должен быть непустым массивом.`);
    condition.conditions.forEach((item, index) => validateCondition(item, `${label}.conditions[${index}]`, depth + 1));
  }
  if (operator === "not") validateCondition(condition.condition, `${label}.condition`, depth + 1);
}

function validateFieldDefinitions(fields: unknown) {
  if (!Array.isArray(fields)) return;
  assertUnique(fields, "key", "Поля формы");
  for (const [index, item] of fields.entries()) {
    const field = asRecord(item);
    if (!field) throw new Error(`Поля формы[${index}]: ожидается объект.`);
    assertKey(field.key, `Поля формы[${index}].key`);
    if (!text(field.label)) throw new Error(`Поля формы[${index}]: подпись обязательна.`);
    if (field.options !== undefined && !Array.isArray(field.options)) throw new Error(`Поля формы[${index}]: options должен быть массивом.`);
    if (Array.isArray(field.options)) assertUnique(field.options, "value", `Варианты поля ${text(field.key)}`);
  }
}

function validateFormulas(formulas: unknown) {
  if (!Array.isArray(formulas)) return;
  assertUnique(formulas, "key", "Формулы");
  for (const [index, item] of formulas.entries()) {
    const formula = asRecord(item);
    if (!formula) throw new Error(`Формулы[${index}]: ожидается объект.`);
    assertKey(formula.key, `Формулы[${index}].key`);
    if (!FORMULA_KINDS.has(text(formula.kind))) throw new Error(`Формулы[${index}]: неизвестная операция.`);
    if (formula.condition !== undefined) validateCondition(formula.condition, `Формулы[${index}].condition`);
  }
}

function validateSteps(steps: unknown) {
  if (!Array.isArray(steps)) return;
  assertUnique(steps, "id", "Шаги сценария");
  const ids = new Set(steps.map((item) => text(asRecord(item)?.id)));
  for (const [index, item] of steps.entries()) {
    const step = asRecord(item);
    if (!step) throw new Error(`Шаги сценария[${index}]: ожидается объект.`);
    assertKey(step.id, `Шаги сценария[${index}].id`);
    if (!text(step.title)) throw new Error(`Шаги сценария[${index}]: заголовок обязателен.`);
    const nextStepId = text(step.nextStepId);
    if (nextStepId && !ids.has(nextStepId)) throw new Error(`Шаги сценария[${index}]: следующий шаг «${nextStepId}» не найден.`);
    if (Array.isArray(step.branches)) {
      for (const [branchIndex, branchValue] of step.branches.entries()) {
        const branch = asRecord(branchValue);
        if (!branch) throw new Error(`Шаги сценария[${index}].branches[${branchIndex}]: ожидается объект.`);
        validateCondition(branch.condition, `Шаги сценария[${index}].branches[${branchIndex}].condition`);
        if (!ids.has(text(branch.nextStepId))) throw new Error(`Шаги сценария[${index}].branches[${branchIndex}]: следующий шаг не найден.`);
      }
    }
    if (Array.isArray(step.checklistItems)) {
      assertUnique(step.checklistItems, "key", `Пункты чек-листа шага ${text(step.id)}`);
      for (const [itemIndex, checklistItem] of step.checklistItems.entries()) {
        const itemRecord = asRecord(checklistItem);
        if (itemRecord?.condition !== undefined) validateCondition(itemRecord.condition, `Пункты чек-листа[${itemIndex}].condition`);
      }
    }
  }
}

function validateResults(results: unknown) {
  if (!Array.isArray(results)) return;
  assertUnique(results, "key", "Результаты");
  for (const [index, item] of results.entries()) {
    const result = asRecord(item);
    if (!result) throw new Error(`Результаты[${index}]: ожидается объект.`);
    assertKey(result.key, `Результаты[${index}].key`);
    if (!text(result.title)) throw new Error(`Результаты[${index}]: заголовок обязателен.`);
    if (result.condition !== undefined) validateCondition(result.condition, `Результаты[${index}].condition`);
    if (Array.isArray(result.links)) {
      for (const [linkIndex, linkValue] of result.links.entries()) {
        const link = asRecord(linkValue);
        assertHref(link?.href, `Результаты[${index}].links[${linkIndex}].href`);
      }
    }
    if (result.ctaHref !== undefined) assertHref(result.ctaHref, `Результаты[${index}].ctaHref`);
  }
}

export const validatePage: CollectionBeforeValidateHook = ({ data }) => {
  if (data?.path !== undefined) assertPublicPath(data.path, "Публичный URL");
  return data;
};

export const validateTool: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  const tool = { ...(asRecord(originalDoc) ?? {}), ...(asRecord(data) ?? {}) };
  if (tool.slug !== undefined) assertPublicPath(tool.slug, "URL инструмента", "/tools/");
  const executionMode = text(tool.executionMode) || "runtime";
  const integration = asRecord(tool.integration);
  const providerKey = text(tool.providerKey) || text(integration?.providerKey);
  if (executionMode === "provider" && providerKey !== "ai.consultant" && !hasProviderAdapter(providerKey)) {
    throw new Error(`Инструменты: ключ адаптера «${providerKey || "не указан"}» не зарегистрирован в приложении.`);
  }
  validateFieldDefinitions(tool.fields);
  validateFormulas(tool.formulas);
  const steps = Array.isArray(tool.steps)
    ? tool.steps.map((item) => {
      const step = asRecord(item);
      return step ? { ...step, id: step.stepId ?? step.id } : item;
    })
    : tool.steps;
  validateSteps(steps);
  validateResults(tool.results);
  return data;
};

export const validateDataTable: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data;
  if (data.key !== undefined) assertKey(data.key, "Ключ таблицы");
  if (Array.isArray(data.columns)) assertUnique(data.columns, "key", "Колонки таблицы");
  if (Array.isArray(data.rows)) assertUnique(data.rows, "key", "Строки таблицы");
  if (data.sourceUrl !== undefined && text(data.sourceUrl) && !/^https:\/\//i.test(text(data.sourceUrl))) {
    throw new Error("Таблицы данных: ссылка на источник должна начинаться с https://.");
  }
  return data;
};
