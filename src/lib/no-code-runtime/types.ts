export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type InputValue = JsonPrimitive | string[];

export type ToolType = "calculator" | "scenario" | "checklist" | "checker" | "ai";

export type ToolFieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "dateRange"
  | "select"
  | "radio"
  | "checkbox"
  | "multiSelect";

export type ToolOption = {
  value: string;
  label: string;
  description?: string;
};

export type ToolFieldDefinition = {
  key: string;
  label: string;
  type: ToolFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: InputValue;
  options?: ToolOption[];
};

export type Condition =
  | { operator: "always" }
  | {
      operator:
        | "equals"
        | "notEquals"
        | "contains"
        | "greaterThan"
        | "greaterThanOrEqual"
        | "lessThan"
        | "lessThanOrEqual"
        | "before"
        | "after";
      field: string;
      value?: InputValue;
    }
  | { operator: "exists"; field: string }
  | { operator: "in" | "notIn"; field: string; values: InputValue[] }
  | { operator: "and" | "or"; conditions: Condition[] }
  | { operator: "not"; condition: Condition };

export type FormulaOperand =
  | { source: "field"; field: string }
  | { source: "constant"; value: number | string }
  | { source: "formula"; formula: string };

export type Formula = {
  key: string;
  label?: string;
  kind:
    | "add"
    | "subtract"
    | "multiply"
    | "divide"
    | "percent"
    | "round"
    | "min"
    | "max"
    | "dateDiffDays"
    | "dateAddDays"
    | "lookup"
    | "conditional"
    | "normalizeNumber";
  left?: FormulaOperand;
  right?: FormulaOperand;
  operands?: FormulaOperand[];
  digits?: number;
  days?: FormulaOperand;
  condition?: Condition;
  thenValue?: FormulaOperand;
  elseValue?: FormulaOperand;
  tableKey?: string;
  lookupField?: string;
  lookupValue?: FormulaOperand;
  resultField?: string;
};

export type ScenarioBranch = {
  condition: Condition;
  nextStepId: string;
};

export type ScenarioStep = {
  id: string;
  type: "question" | "info" | "branch" | "calculation" | "checklist" | "result" | "cta";
  title: string;
  body?: string;
  fieldKey?: string;
  options?: ToolOption[];
  required?: boolean;
  formulaKey?: string;
  resultKey?: string;
  nextStepId?: string;
  branches?: ScenarioBranch[];
  checklistItems?: Array<{
    key: string;
    label: string;
    description?: string;
    group?: string;
    condition?: Condition;
  }>;
  relatedPages?: Array<{
    href: string;
    label: string;
  }>;
};

export type ToolResult = {
  key: string;
  status: "success" | "warning" | "error" | "info";
  title: string;
  body?: string;
  condition?: Condition;
  links?: Array<{ href: string; label: string }>;
  ctaLabel?: string;
  ctaHref?: string;
};

export type DataTableRow = {
  key: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  values: Record<string, InputValue>;
};

export type DataTableDefinition = {
  key: string;
  title: string;
  columns: Array<{ key: string; label: string; type: "text" | "number" | "date" | "currency" }>;
  rows: DataTableRow[];
};

export type ToolUiCopy = {
  nextLabel?: string;
  backLabel?: string;
  resetLabel?: string;
  calculateLabel?: string;
  startLabel?: string;
  resultLabel?: string;
  loadingLabel?: string;
  errorLabel?: string;
  emptyLabel?: string;
  requiredLabel?: string;
};

export type ToolIntegration = {
  providerKey?: string;
  requestMapping?: Record<string, string>;
  responseMapping?: Record<string, string>;
  timeoutMs?: number;
  enabled?: boolean;
};

export type AiToolConfig = {
  systemPrompt?: string;
  tone?: string;
  answerFormat?: string;
  sourceFilters?: string[];
  maxSources?: number;
  maxTokens?: number;
};

export type ToolDefinition = {
  slug: string;
  toolType: ToolType;
  title: string;
  description?: string;
  eyebrow?: string;
  fields?: ToolFieldDefinition[];
  formulas?: Formula[];
  steps?: ScenarioStep[];
  results?: ToolResult[];
  uiCopy?: ToolUiCopy;
  integration?: ToolIntegration;
  ai?: AiToolConfig;
};

export type ToolEvaluation = {
  values: Record<string, InputValue>;
  result?: ToolResult;
};
