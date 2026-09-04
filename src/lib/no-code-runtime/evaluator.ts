import type {
  Condition,
  DataTableDefinition,
  Formula,
  FormulaOperand,
  InputValue,
  ToolDefinition,
  ToolEvaluation,
} from "./types";

type RuntimeContext = Record<string, unknown>;

function getContextValue(context: RuntimeContext, key: string) {
  return key.split(".").reduce<unknown>((value, part) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[part];
  }, context);
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/\s/g, "").replace(",", ".");
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

function asDate(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function compareValues(left: unknown, right: unknown) {
  const leftNumber = asNumber(left);
  const rightNumber = asNumber(right);
  if (leftNumber !== null && rightNumber !== null) return leftNumber - rightNumber;

  const leftDate = asDate(left);
  const rightDate = asDate(right);
  if (leftDate !== null && rightDate !== null) return leftDate - rightDate;

  return String(left ?? "").localeCompare(String(right ?? ""), "ru", { sensitivity: "base" });
}

function includesValue(container: unknown, value: unknown) {
  if (Array.isArray(container)) return container.some((item) => compareValues(item, value) === 0);
  return String(container ?? "").toLocaleLowerCase().includes(String(value ?? "").toLocaleLowerCase());
}

export function evaluateCondition(condition: Condition | undefined, context: RuntimeContext): boolean {
  if (!condition || condition.operator === "always") return true;

  switch (condition.operator) {
    case "and":
      return condition.conditions.every((item) => evaluateCondition(item, context));
    case "or":
      return condition.conditions.some((item) => evaluateCondition(item, context));
    case "not":
      return !evaluateCondition(condition.condition, context);
    case "exists":
      return !isEmpty(context[condition.field]);
    case "equals":
      return compareValues(context[condition.field], condition.value) === 0;
    case "notEquals":
      return compareValues(context[condition.field], condition.value) !== 0;
    case "contains":
      return includesValue(context[condition.field], condition.value);
    case "in":
      return condition.values.some((value) => compareValues(context[condition.field], value) === 0);
    case "notIn":
      return !condition.values.some((value) => compareValues(context[condition.field], value) === 0);
    case "greaterThan":
      return compareValues(context[condition.field], condition.value) > 0;
    case "greaterThanOrEqual":
      return compareValues(context[condition.field], condition.value) >= 0;
    case "lessThan":
      return compareValues(context[condition.field], condition.value) < 0;
    case "lessThanOrEqual":
      return compareValues(context[condition.field], condition.value) <= 0;
    case "before":
      return compareValues(context[condition.field], condition.value) < 0;
    case "after":
      return compareValues(context[condition.field], condition.value) > 0;
    default:
      return false;
  }
}

function resolveOperand(
  operand: FormulaOperand | undefined,
  context: RuntimeContext,
  computed: RuntimeContext,
) {
  if (!operand) return null;
  if (operand.source === "field") return context[operand.field];
  if (operand.source === "formula") return computed[operand.formula];
  return operand.value;
}

function finiteOrNull(value: number) {
  return Number.isFinite(value) ? value : null;
}

export function evaluateFormula(
  formula: Formula,
  context: RuntimeContext,
  computed: RuntimeContext = {},
  tables: DataTableDefinition[] = [],
): InputValue {
  const left = resolveOperand(formula.left, context, computed);
  const right = resolveOperand(formula.right, context, computed);
  const operands = (formula.operands ?? []).map((operand) => resolveOperand(operand, context, computed));

  switch (formula.kind) {
    case "normalizeNumber":
      return asNumber(left) ?? 0;
    case "add":
      return finiteOrNull((asNumber(left) ?? 0) + (asNumber(right) ?? 0)) ?? 0;
    case "subtract":
      return finiteOrNull((asNumber(left) ?? 0) - (asNumber(right) ?? 0)) ?? 0;
    case "multiply":
      return finiteOrNull((asNumber(left) ?? 0) * (asNumber(right) ?? 0)) ?? 0;
    case "divide": {
      const divisor = asNumber(right);
      return divisor === null || divisor === 0 ? 0 : finiteOrNull((asNumber(left) ?? 0) / divisor) ?? 0;
    }
    case "percent":
      return finiteOrNull((asNumber(left) ?? 0) * (asNumber(right) ?? 0) / 100) ?? 0;
    case "round": {
      const digits = Math.max(0, Math.min(8, formula.digits ?? 0));
      const factor = 10 ** digits;
      return Math.round((asNumber(left) ?? 0) * factor) / factor;
    }
    case "min":
      return Math.min(...operands.map((value) => asNumber(value) ?? 0));
    case "max":
      return Math.max(...operands.map((value) => asNumber(value) ?? 0));
    case "dateDiffDays": {
      const start = asDate(left);
      const end = asDate(right);
      return start === null || end === null ? 0 : Math.round((end - start) / 86_400_000);
    }
    case "dateAddDays": {
      const date = asDate(left);
      const days = asNumber(resolveOperand(formula.days, context, computed));
      return date === null || days === null ? "" : new Date(date + days * 86_400_000).toISOString().slice(0, 10);
    }
    case "conditional":
      return evaluateCondition(formula.condition, { ...context, ...computed })
        ? (resolveOperand(formula.thenValue, context, computed) as InputValue)
        : (resolveOperand(formula.elseValue, context, computed) as InputValue);
    case "lookup": {
      const table = tables.find((item) => item.key === formula.tableKey);
      const lookupValue = resolveOperand(formula.lookupValue, context, computed);
      const row = table?.rows.find((item) => compareValues(item.values[formula.lookupField ?? "key"], lookupValue) === 0);
      return row?.values[formula.resultField ?? "value"] ?? "";
    }
    default:
      return 0;
  }
}

export function evaluateTool(
  definition: ToolDefinition,
  answers: RuntimeContext,
  tables: DataTableDefinition[] = [],
  preferredResultKey?: string,
): ToolEvaluation {
  const computed: RuntimeContext = {};
  for (const formula of definition.formulas ?? []) {
    computed[formula.key] = evaluateFormula(formula, answers, computed, tables);
  }

  const context = { ...answers, ...computed };
  const matchingResults = (definition.results ?? []).filter((item) => evaluateCondition(item.condition, context));
  const result = preferredResultKey
    ? matchingResults.find((item) => item.key === preferredResultKey) ?? matchingResults[0]
    : matchingResults[0];
  return { values: computed as Record<string, InputValue>, result };
}

export function renderTemplate(template: string, context: RuntimeContext) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key: string) => {
    const value = getContextValue(context, key);
    return isEmpty(value) ? "" : Array.isArray(value) ? value.join(", ") : String(value);
  });
}

export function getNextStepId(
  definition: ToolDefinition,
  currentStepId: string,
  context: RuntimeContext,
) {
  const steps = definition.steps ?? [];
  const index = steps.findIndex((step) => step.id === currentStepId);
  const current = steps[index];
  if (!current) return undefined;

  const branch = current.branches?.find((item) => evaluateCondition(item.condition, context));
  return branch?.nextStepId ?? current.nextStepId ?? steps[index + 1]?.id;
}
