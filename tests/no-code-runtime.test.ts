import { describe, expect, it } from "vitest";
import { evaluateCondition, evaluateTool, getNextStepId, renderTemplate } from "@/lib/no-code-runtime/evaluator";
import { applyRequestMapping, applyResponseMapping } from "@/lib/tools/provider-adapters";

describe("no-code tool runtime", () => {
  it("evaluates formulas, lookups and conditional results without executing code", () => {
    const tool = {
      slug: "/tools/example",
      toolType: "calculator" as const,
      title: "Example",
      fields: [{ key: "region", label: "Регион", type: "select" as const }],
      formulas: [
        { key: "monthly", kind: "lookup" as const, tableKey: "prices", lookupField: "region", lookupValue: { source: "field" as const, field: "region" }, resultField: "amount" },
        { key: "total", kind: "multiply" as const, left: { source: "formula" as const, formula: "monthly" }, right: { source: "constant" as const, value: 2 } },
      ],
      results: [
        { key: "ok", status: "success" as const, title: "Итого", body: "{{total}} ₽", condition: { operator: "greaterThan" as const, field: "total", value: 0 } },
      ],
    };
    const evaluation = evaluateTool(tool, { region: "Москва" }, [{ key: "prices", title: "Цены", columns: [], rows: [{ key: "moscow", values: { region: "Москва", amount: 7500 } }] }]);
    expect(evaluation.values.total).toBe(15000);
    expect(evaluation.result?.key).toBe("ok");
    expect(renderTemplate(evaluation.result?.body || "", { total: evaluation.values.total })).toBe("15000 ₽");
  });

  it("supports nested boolean conditions and scenario branches", () => {
    const context = { citizenship: "cis", income: 100 };
    expect(evaluateCondition({ operator: "and", conditions: [{ operator: "equals", field: "citizenship", value: "cis" }, { operator: "greaterThanOrEqual", field: "income", value: 100 }] }, context)).toBe(true);
    expect(getNextStepId({ slug: "/tools/example", toolType: "scenario", title: "Example", steps: [{ id: "start", type: "question", title: "Start", branches: [{ condition: { operator: "equals", field: "citizenship", value: "cis" }, nextStepId: "cis" }], nextStepId: "default" }, { id: "cis", type: "result", title: "CIS" }, { id: "default", type: "result", title: "Default" }] }, "start", context)).toBe("cis");
  });

  it("maps only scalar response data and never evaluates mapping text", () => {
    const request = applyRequestMapping({ region: "77", number: "123" }, { externalRegion: "region" });
    expect(request.externalRegion).toBe("77");
    const mapped = applyResponseMapping({ values: { statusCode: "ready" }, result: { key: "x", status: "info", title: "Готово" } }, { externalStatus: "values.statusCode", "result.body": "result.title" });
    expect(mapped.values?.externalStatus).toBe("ready");
    expect(mapped.result?.body).toBe("Готово");
  });
});
