import { getPayload } from "payload";
import { evaluateTool } from "../src/lib/no-code-runtime/evaluator";
import type { DataTableDefinition, InputValue, ToolDefinition } from "../src/lib/no-code-runtime/types";

type RuleTest = {
  id: string;
  name: string;
  tool: string | CmsRuleTool;
  answers: unknown;
  expectedStatus: string;
  expectedValues?: unknown;
  enabled?: boolean;
};

type CmsRuleTool = ToolDefinition & {
  id: string;
  dataTableKeys?: string[];
  executionMode?: "runtime" | "provider";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isInputValue(value: unknown): value is InputValue {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean" || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

function normalizeDataTableRows(rows: unknown): DataTableDefinition["rows"] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const source = row && typeof row === "object" ? row as Record<string, unknown> : {};
    const values = source.values && typeof source.values === "object" ? source.values as Record<string, InputValue> : {};
    return {
      key: typeof source.key === "string" ? source.key : "",
      effectiveFrom: typeof source.effectiveFrom === "string" ? source.effectiveFrom : undefined,
      effectiveTo: typeof source.effectiveTo === "string" ? source.effectiveTo : undefined,
      values,
    };
  });
}

function valuesMatch(actual: unknown, expected: unknown): boolean {
  if (typeof actual === "number" && typeof expected === "number") return Math.abs(actual - expected) < 0.000001;
  if (Array.isArray(actual) && Array.isArray(expected)) return actual.length === expected.length && actual.every((value, index) => valuesMatch(value, expected[index]));
  return actual === expected;
}

async function findTables(payload: Awaited<ReturnType<typeof getPayload>>, tool: CmsRuleTool) {
  const keys = Array.isArray(tool.dataTableKeys) ? tool.dataTableKeys.filter((key): key is string => typeof key === "string") : [];
  if (keys.length === 0) return [];
  const result = await payload.find({ collection: "data-tables", depth: 0, limit: 100, where: { key: { in: keys } }, overrideAccess: true });
  return result.docs.map((table) => ({ ...table, rows: normalizeDataTableRows(table.rows) })) as unknown as DataTableDefinition[];
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to run Payload rule tests.");
  process.env.PAYLOAD_DB_PUSH = "false";
  const { default: configPromise } = await import("../src/payload.config.mjs");
  const payload = await getPayload({ config: configPromise });
  try {
    const testResult = await payload.find({ collection: "rule-test-cases", depth: 2, limit: 1000, where: { enabled: { equals: true } }, overrideAccess: true });
    const failures: string[] = [];

    for (const rawTest of testResult.docs as unknown as RuleTest[]) {
      const tool = typeof rawTest.tool === "string"
        ? await payload.findByID({ collection: "tools", id: rawTest.tool, depth: 1, overrideAccess: true }) as unknown as RuleTest["tool"]
        : rawTest.tool;
      if (!isRecord(tool) || (typeof tool.executionMode === "string" && tool.executionMode === "provider")) continue;
      const answers = isRecord(rawTest.answers) ? rawTest.answers as Record<string, InputValue> : {};
      const evaluation = evaluateTool(tool as CmsRuleTool, answers, await findTables(payload, tool as CmsRuleTool));
      const actualStatus = evaluation.result?.status || "none";
      if (actualStatus !== rawTest.expectedStatus) failures.push(`${rawTest.name}: expected status ${rawTest.expectedStatus}, received ${actualStatus}`);
      if (isRecord(rawTest.expectedValues)) {
        for (const [key, expected] of Object.entries(rawTest.expectedValues)) {
          if (!isInputValue(expected) || !valuesMatch(evaluation.values[key], expected)) failures.push(`${rawTest.name}: expected ${key}=${String(expected)}, received ${String(evaluation.values[key])}`);
        }
      }
    }

    if (failures.length > 0) {
      console.error(`Payload rule tests failed (${failures.length}):`);
      failures.forEach((failure) => console.error(`- ${failure}`));
      process.exitCode = 1;
      return;
    }
    console.log(`Payload rule tests passed: ${testResult.docs.length}`);
  } finally {
    await payload.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
