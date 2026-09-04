import { NextResponse } from "next/server";
import { evaluateTool, renderTemplate } from "@/lib/no-code-runtime/evaluator";
import type { InputValue, ToolDefinition, ToolResult } from "@/lib/no-code-runtime/types";
import { readJsonBody } from "@/lib/security";
import { getToolBySlug, getToolDataTables } from "@/lib/cms/queries";
import { applyRequestMapping, applyResponseMapping, runProviderAdapter } from "@/lib/tools/provider-adapters";

type RouteContext = { params: Promise<{ slug: string[] }> };

function isAnswers(value: unknown): value is Record<string, InputValue> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function renderResult(result: ToolResult | undefined, values: Record<string, InputValue>) {
  if (!result) return undefined;
  return {
    ...result,
    title: renderTemplate(result.title, values),
    body: result.body ? renderTemplate(result.body, values) : result.body,
  };
}

function cleanAnswers(tool: ToolDefinition, answers: Record<string, InputValue>) {
  const allowed = new Set((tool.fields ?? []).map((field) => field.key));
  return Object.fromEntries(Object.entries(answers).filter(([key]) => allowed.has(key)));
}

function isEmpty(value: InputValue | undefined) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function normalizeAnswers(tool: ToolDefinition, answers: Record<string, InputValue>) {
  const normalized = { ...answers };

  for (const field of tool.fields ?? []) {
    const value = normalized[field.key];
    if (isEmpty(value)) {
      if (field.required) return { error: `Заполните обязательное поле: ${field.label}` } as const;
      continue;
    }

    if (field.type === "number" || field.type === "currency") {
      const number = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value.replace(/\s/g, "").replace(",", ".")) : NaN;
      if (!Number.isFinite(number)) return { error: `Поле «${field.label}» должно содержать число.` } as const;
      if (field.min !== undefined && number < field.min) return { error: `Значение поля «${field.label}» не может быть меньше ${field.min}.` } as const;
      if (field.max !== undefined && number > field.max) return { error: `Значение поля «${field.label}» не может быть больше ${field.max}.` } as const;
      normalized[field.key] = number;
      continue;
    }

    if (field.type === "checkbox") {
      if (typeof value !== "boolean") return { error: `Поле «${field.label}» заполнено некорректно.` } as const;
      continue;
    }

    if (field.type === "multiSelect") {
      if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) return { error: `Поле «${field.label}» заполнено некорректно.` } as const;
      const options = new Set((field.options ?? []).map((option) => option.value));
      if (options.size > 0 && value.some((item) => !options.has(item))) return { error: `Поле «${field.label}» содержит неизвестный вариант.` } as const;
      continue;
    }

    if (field.type === "dateRange") {
      if (!Array.isArray(value) || value.length !== 2 || !value.every((item) => typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item))) {
        return { error: `Поле «${field.label}» должно содержать диапазон дат.` } as const;
      }
      if (value[0] > value[1]) return { error: `В поле «${field.label}» дата начала не может быть позже даты окончания.` } as const;
      continue;
    }

    if (typeof value !== "string") return { error: `Поле «${field.label}» заполнено некорректно.` } as const;
    if (value.length > 5000) return { error: `Поле «${field.label}» слишком длинное.` } as const;
    if (field.type === "select" || field.type === "radio") {
      const options = new Set((field.options ?? []).map((option) => option.value));
      if (options.size > 0 && !options.has(value)) return { error: `Поле «${field.label}» содержит неизвестный вариант.` } as const;
    }
    if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { error: `Поле «${field.label}» должно содержать дату.` } as const;
  }

  return { answers: normalized } as const;
}

export async function POST(request: Request, context: RouteContext) {
  const body = await readJsonBody<{ answers?: unknown }>(request, 32 * 1024);
  if (!body || !isAnswers(body.answers)) {
    return NextResponse.json({ error: "Некорректные входные данные." }, { status: 400 });
  }

  const { slug } = await context.params;
  if (slug.at(-1) !== "run" || slug.length < 2) {
    return NextResponse.json({ error: "Маршрут инструмента не найден." }, { status: 404 });
  }
  const toolSlug = `/tools/${slug.slice(0, -1).join("/")}`;
  const tool = await getToolBySlug(toolSlug);
  if (!tool) return NextResponse.json({ error: "Инструмент не найден." }, { status: 404 });

  const validation = normalizeAnswers(tool, cleanAnswers(tool, body.answers));
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
  const answers = validation.answers;
  const tables = await getToolDataTables(tool);
  try {
    if (tool.executionMode === "provider") {
      if (tool.integration?.enabled === false) {
        return NextResponse.json({ error: "Инструмент временно отключён редактором." }, { status: 422 });
      }
      const providerKey = tool.providerKey || tool.integration?.providerKey;
      const requestAnswers = applyRequestMapping(answers, tool.integration?.requestMapping);
      const adapterResult = applyResponseMapping(runProviderAdapter(providerKey, requestAnswers, tool), tool.integration?.responseMapping);
      return NextResponse.json({ values: adapterResult.values ?? {}, result: adapterResult.result });
    }

    const evaluation = evaluateTool(tool, answers, tables);
    return NextResponse.json({
      values: evaluation.values,
      result: renderResult(evaluation.result, { ...answers, ...evaluation.values }),
    });
  } catch (error) {
    console.error("Tool runtime error", error);
    return NextResponse.json({ error: "Не удалось выполнить сценарий." }, { status: 422 });
  }
}
