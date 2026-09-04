import type { InputValue, ToolDefinition } from "@/lib/no-code-runtime/types";

export type ProviderAdapterResult = {
  values?: Record<string, InputValue>;
  result?: {
    key: string;
    status: "success" | "warning" | "error" | "info";
    title: string;
    body?: string;
    links?: Array<{ href: string; label: string }>;
    ctaLabel?: string;
    ctaHref?: string;
  };
};

type Mapping = Record<string, string>;

function resolvePath(value: unknown, path: string): unknown {
  if (!path || path.length > 160) return undefined;
  return path.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    return (current as Record<string, unknown>)[segment];
  }, value);
}

function isInputValue(value: unknown): value is InputValue {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean" || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

export function applyRequestMapping(answers: Record<string, InputValue>, mapping?: Mapping) {
  if (!mapping) return answers;
  const mapped = { ...answers };
  for (const [target, source] of Object.entries(mapping).slice(0, 100)) {
    if (!/^[A-Za-z][A-Za-z0-9_.-]{0,95}$/.test(target) || typeof source !== "string") continue;
    const value = resolvePath(answers, source);
    if (isInputValue(value)) mapped[target] = value;
  }
  return mapped;
}

export function applyResponseMapping(adapterResult: ProviderAdapterResult, mapping?: Mapping): ProviderAdapterResult {
  if (!mapping) return adapterResult;
  const context = { values: adapterResult.values ?? {}, result: adapterResult.result };
  const values = { ...(adapterResult.values ?? {}) };
  const result = adapterResult.result ? { ...adapterResult.result } : undefined;

  for (const [target, source] of Object.entries(mapping).slice(0, 100)) {
    if (typeof source !== "string") continue;
    const value = resolvePath(context, source);
    if (!isInputValue(value)) continue;
    if (target.startsWith("result.")) {
      const key = target.slice("result.".length) as keyof NonNullable<ProviderAdapterResult["result"]>;
      if (result && ["key", "status", "title", "body", "ctaLabel", "ctaHref"].includes(key)) {
        if (key === "status" && (typeof value !== "string" || !["success", "warning", "error", "info"].includes(value))) continue;
        if (key !== "status" && typeof value !== "string") continue;
        result[key] = value as never;
      }
      continue;
    }
    if (/^[A-Za-z][A-Za-z0-9_.-]{0,95}$/.test(target)) values[target] = value;
  }

  return { values, result };
}

type ProviderAdapter = (answers: Record<string, InputValue>, tool: ToolDefinition) => ProviderAdapterResult;

function numberHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = value.charCodeAt(index) + ((hash << 5) - hash);
  return Math.abs(hash);
}

function simulationResult(title: string, body: string, status: "success" | "warning" | "info" = "info"): ProviderAdapterResult {
  return { result: { key: "simulation", status, title, body } };
}

const adapters: Record<string, ProviderAdapter> = {
  "simulation.passport": (answers) => {
    const series = String(answers.series ?? "");
    const number = String(answers.number ?? "");
    const isValid = numberHash(`${series}${number}`.toLowerCase()) % 4 !== 3;
    return simulationResult(
      isValid ? "Паспорт прошёл первичный контроль" : "Нужна дополнительная проверка документа",
      isValid
        ? "Введённые серия и номер не попали в демонстрационный сценарий недействительного документа. Для юридически значимого ответа используйте официальный сервис МВД."
        : "Демонстрационный сценарий показывает возможный риск. Не принимайте решение по этому результату — перепроверьте документ через официальный сервис МВД.",
      isValid ? "success" : "warning",
    );
  },
  "simulation.document-check": (answers) => simulationResult(
    "Проверка подготовлена",
    `Получено полей: ${Object.keys(answers).length}. Инструмент выполняет форматную проверку. Сторонний сайт не имеет доступа к закрытым реестрам МВД, поэтому официальный результат нужно получить на сайте ведомства.`,
    "warning",
  ),
  "simulation.status-check": (answers, tool) => simulationResult(
    "Запрос принят в демонстрационном сценарии",
    `${tool.title}: получено полей — ${Object.keys(answers).length}. Этот результат не является сведением из реестра МВД. Проверьте готовность документа через официальный сервис или подразделение, принявшее заявление.`,
    "warning",
  ),
};

export function getProviderAdapter(providerKey: string | undefined) {
  return providerKey ? adapters[providerKey] : undefined;
}

export function hasProviderAdapter(providerKey: string | undefined) {
  return Boolean(getProviderAdapter(providerKey));
}

export function runProviderAdapter(providerKey: string | undefined, answers: Record<string, InputValue>, tool: ToolDefinition) {
  const adapter = getProviderAdapter(providerKey);
  if (!adapter) throw new Error("Unknown tool provider adapter.");
  return adapter(answers, tool);
}
