"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, RotateCcw, Send } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useAIChat } from "@/components/chat/AIChatProvider";
import SafeMessageText from "@/components/chat/SafeMessageText";
import { evaluateCondition, evaluateTool, getNextStepId, renderTemplate } from "@/lib/no-code-runtime/evaluator";
import type { DataTableDefinition, InputValue, ScenarioStep, ToolDefinition, ToolFieldDefinition, ToolResult } from "@/lib/no-code-runtime/types";

export type CmsRuntimeTool = ToolDefinition & {
  executionMode?: "runtime" | "provider";
  providerKey?: string;
  integration?: ToolDefinition["integration"];
};

type ToolRuntimeProps = {
  tool: CmsRuntimeTool;
  tables: DataTableDefinition[];
};

type RunState = "idle" | "working" | "done";

function isSafeHref(href: string) {
  return href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https?:\/\//i.test(href);
}

function safeHref(value: unknown) {
  return typeof value === "string" && isSafeHref(value) ? value : "#";
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function initialAnswers(fields: ToolFieldDefinition[] | undefined) {
  return Object.fromEntries((fields ?? []).map((field) => [field.key, field.defaultValue ?? (field.type === "checkbox" ? false : field.type === "multiSelect" ? [] : "")]));
}

function inputValue(value: InputValue | undefined) {
  return Array.isArray(value) ? value.join(", ") : String(value ?? "");
}

function ResultCard({ result, values, onReset, resetLabel }: { result: ToolResult; values: Record<string, InputValue>; onReset: () => void; resetLabel: string }) {
  const tone = result.status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : result.status === "error" ? "border-red-200 bg-red-50 text-red-900" : result.status === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-blue-900";
  return (
    <div className={`rounded-2xl border p-6 ${tone}`}>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold">{renderTemplate(result.title, values)}</h2>
          {result.body ? <div className="mt-3 text-sm leading-6"><SafeMessageText text={renderTemplate(result.body, values)} /></div> : null}
          {result.links && result.links.length > 0 ? (
            <div className="mt-5 grid gap-2">
              {result.links.map((link) => <Link key={link.href} href={safeHref(link.href)} className="font-bold underline">{link.label}</Link>)}
            </div>
          ) : null}
          {result.ctaHref && result.ctaLabel ? <Link href={safeHref(result.ctaHref)} className="button-primary mt-5">{result.ctaLabel}</Link> : null}
        </div>
      </div>
      <button type="button" onClick={onReset} className="button-secondary mt-6 inline-flex items-center gap-2 text-sm">
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> {resetLabel}
      </button>
    </div>
  );
}

function FieldControl({ field, value, onChange }: { field: ToolFieldDefinition; value: InputValue | undefined; onChange: (value: InputValue) => void }) {
  const baseClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#1f2c41] outline-none transition focus:border-[#2d5145] focus:ring-2 focus:ring-[#2d5145]/10";
  if (field.type === "checkbox") {
    return <label className="mt-2 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={value === true} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4" />{field.label}</label>;
  }
  if (field.type === "select") {
    return <select className={baseClass} value={inputValue(value)} onChange={(event) => onChange(event.target.value)}><option value="">Выберите вариант</option>{(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  }
  if (field.type === "radio") {
    return <div className="mt-2 grid gap-2">{(field.options ?? []).map((option) => <label key={option.value} className={`rounded-xl border px-4 py-3 text-sm transition ${value === option.value ? "border-[#2d5145] bg-[#eef3ed]" : "border-slate-200 bg-white"}`}><input type="radio" name={field.key} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="mr-2" />{option.label}{option.description ? <span className="mt-1 block pl-5 text-xs text-slate-500">{option.description}</span> : null}</label>)}</div>;
  }
  if (field.type === "multiSelect") {
    const selected = Array.isArray(value) ? value : [];
    return <div className="mt-2 grid gap-2">{(field.options ?? []).map((option) => <label key={option.value} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><input type="checkbox" checked={selected.includes(option.value)} onChange={(event) => onChange(event.target.checked ? [...selected, option.value] : selected.filter((item) => item !== option.value))} className="mt-0.5 h-4 w-4" /><span>{option.label}{option.description ? <span className="mt-1 block text-xs text-slate-500">{option.description}</span> : null}</span></label>)}</div>;
  }
  if (field.type === "dateRange") {
    const selected = Array.isArray(value) ? value : [];
    const updateDate = (index: number, nextValue: string) => {
      const next = [String(selected[0] ?? ""), String(selected[1] ?? "")];
      next[index] = nextValue;
      onChange(next);
    };
    return <div className="mt-2 grid gap-2 sm:grid-cols-2"><input className={baseClass.replace("mt-2 ", "")} type="date" value={String(selected[0] ?? "")} onChange={(event) => updateDate(0, event.target.value)} aria-label={`${field.label}: начало`} /><input className={baseClass.replace("mt-2 ", "")} type="date" value={String(selected[1] ?? "")} onChange={(event) => updateDate(1, event.target.value)} aria-label={`${field.label}: окончание`} /></div>;
  }
  const htmlType = field.type === "number" || field.type === "currency" ? "number" : field.type === "date" ? "date" : "text";
  return field.type === "textarea" ? <textarea className={`${baseClass} min-h-28`} value={inputValue(value)} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} /> : <input className={baseClass} type={htmlType} value={inputValue(value)} placeholder={field.placeholder} min={field.min} max={field.max} step={field.step} onChange={(event) => onChange(htmlType === "number" ? (event.target.value === "" ? "" : Number(event.target.value)) : event.target.value)} />;
}

function ToolField({ field, value, onChange }: { field: ToolFieldDefinition; value: InputValue | undefined; onChange: (value: InputValue) => void }) {
  return <div><label className="block text-sm font-extrabold text-[#1f2c41]" htmlFor={field.type === "checkbox" ? undefined : `tool-${field.key}`}>{field.type === "checkbox" ? null : field.label}{field.required ? <span className="ml-1 text-[#b24a3a]">*</span> : null}</label>{field.helpText ? <p className="mt-1 text-xs leading-5 text-slate-500">{field.helpText}</p> : null}<FieldControl field={field} value={value} onChange={onChange} /></div>;
}

function AiRuntime({ tool }: { tool: CmsRuntimeTool }) {
  const { messages, language, isTyping, errorMsg, remainingRequests, sendQuestion } = useAIChat();
  const [question, setQuestion] = useState("");
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    const current = question;
    setQuestion("");
    await sendQuestion(current, { context: tool.description || tool.title, toolSlug: tool.slug });
  };
  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#a98a4f]">ИИ-помощник</span>{typeof remainingRequests === "number" ? <span className="text-xs text-slate-500">Осталось вопросов: {remainingRequests}</span> : null}</div>
        <div className="max-h-[32rem] space-y-4 overflow-y-auto pr-1" aria-live="polite">
          {messages.length === 0 ? <p className="rounded-xl bg-[#f4f6f1] p-4 text-sm leading-6 text-slate-600">{tool.ai?.tone || "Опишите ситуацию — помощник найдёт релевантные инструкции и источники."}</p> : null}
          {messages.slice(-10).map((message) => <div key={message.id} className={`rounded-xl p-4 text-sm leading-6 ${message.sender === "user" ? "ml-8 bg-[#1c2925] text-white" : "mr-8 bg-[#f4f6f1] text-[#1f2c41]"}`}><SafeMessageText text={message.text || (isTyping ? "Печатаю ответ…" : "")} />{message.sources?.length ? <p className="mt-3 border-t border-black/10 pt-3 text-xs text-slate-500">Источников: {message.sources.length}</p> : null}</div>)}
          {errorMsg ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorMsg}</p> : null}
        </div>
        <form onSubmit={send} className="mt-5 flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Например: какие документы нужны для ВНЖ?" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#2d5145]" disabled={isTyping} /><button type="submit" className="button-primary inline-flex items-center gap-2" disabled={isTyping || !question.trim()}><Send className="h-4 w-4" aria-hidden="true" /> Спросить</button></form>
        {language !== "ru" ? <p className="mt-2 text-xs text-slate-500">Язык ответа: {language}</p> : null}
      </div>
    </div>
  );
}

function StepBody({ step, answers, computed }: { step: ScenarioStep; answers: Record<string, InputValue>; computed: Record<string, InputValue> }) {
  const text = step.body ? renderTemplate(step.body, { ...answers, ...computed }) : "";
  return text ? <div className="mb-5 text-sm leading-6 text-slate-600"><SafeMessageText text={text} /></div> : null;
}

function CalculationValue({ step, computed }: { step: ScenarioStep; computed: Record<string, InputValue> }) {
  if (step.type !== "calculation" || !step.formulaKey || computed[step.formulaKey] === undefined) return null;
  return <p className="mb-5 rounded-xl bg-[#f4f6f1] p-4 text-sm font-bold text-[#1f2c41]">{step.formulaKey}: {inputValue(computed[step.formulaKey])}</p>;
}

function ChecklistStep({ step, answers, computed, checkedItems, onToggle }: { step: ScenarioStep; answers: Record<string, InputValue>; computed: Record<string, InputValue>; checkedItems: string[]; onToggle: (key: string, checked: boolean) => void }) {
  const visibleItems = (step.checklistItems ?? []).filter((item) => evaluateCondition(item.condition, { ...answers, ...computed }));
  const groups = visibleItems.reduce<Record<string, typeof visibleItems>>((result, item) => {
    const group = item.group || "Документы";
    result[group] ??= [];
    result[group].push(item);
    return result;
  }, {});
  return <div className="mt-5 grid gap-5">{Object.entries(groups).map(([group, items]) => <div key={group}><h3 className="mb-2 text-sm font-extrabold text-[#1f2c41]">{group}</h3><div className="grid gap-2">{items.map((item) => <label key={item.key} className="flex gap-3 rounded-xl border border-slate-200 p-3 text-sm"><input type="checkbox" checked={checkedItems.includes(item.key)} onChange={(event) => onToggle(item.key, event.target.checked)} className="mt-0.5 h-4 w-4" /><span><span className={checkedItems.includes(item.key) ? "font-semibold line-through text-slate-400" : "font-semibold text-[#1f2c41]"}>{item.label}</span>{item.description ? <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span> : null}</span></label>)}</div></div>)}</div>;
}

export default function ToolRuntime({ tool, tables }: ToolRuntimeProps) {
  const fields = useMemo(() => tool.fields ?? [], [tool.fields]);
  const [answers, setAnswers] = useState<Record<string, InputValue>>(() => initialAnswers(fields));
  const [runState, setRunState] = useState<RunState>("idle");
  const [result, setResult] = useState<ToolResult | undefined>();
  const [computed, setComputed] = useState<Record<string, InputValue>>({});
  const [error, setError] = useState<string | null>(null);
  const [stepId, setStepId] = useState<string | undefined>(tool.steps?.[0]?.id);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const currentStep = useMemo(() => tool.steps?.find((step) => step.id === stepId), [stepId, tool.steps]);
  const setAnswer = useCallback((key: string, value: InputValue) => setAnswers((current) => ({ ...current, [key]: value })), []);

  const validate = useCallback((onlyField?: string, force = false) => {
    const missing = fields.find((field) => {
      const shouldValidate = onlyField ? field.key === onlyField && (force || field.required) : field.required;
      return shouldValidate && isEmpty(answers[field.key]);
    });
    if (!missing) return true;
    setError(`${tool.uiCopy?.requiredLabel || "Заполните обязательное поле"}: ${missing.label}`);
    return false;
  }, [answers, fields, tool.uiCopy?.requiredLabel]);

  const execute = useCallback(async (currentAnswers = answers, shouldValidate = true, preferredResultKey?: string) => {
    if (shouldValidate && !validate()) return;
    setError(null);
    setRunState("working");
    try {
      if (tool.executionMode === "provider") {
        const response = await fetch(`/api/tools/${tool.slug.replace(/^\/tools\//, "")}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: currentAnswers }) });
        const data = await response.json() as { values?: Record<string, InputValue>; result?: ToolResult; error?: string };
        if (!response.ok) throw new Error(data.error || "Не удалось выполнить проверку.");
        setComputed(data.values ?? {});
        setResult(data.result);
      } else {
        const evaluationAnswers = { ...currentAnswers, checkedItems, checkedCount: checkedItems.length } as Record<string, InputValue>;
        const evaluation = evaluateTool(tool, evaluationAnswers, tables, preferredResultKey);
        setComputed({ ...evaluation.values, checkedItems, checkedCount: checkedItems.length });
        setResult(evaluation.result);
      }
      setRunState("done");
    } catch (cause) {
      setRunState("idle");
      setError(cause instanceof Error ? cause.message : "Не удалось выполнить сценарий.");
    }
  }, [answers, checkedItems, tables, tool, validate]);

  const reset = useCallback(() => {
    setAnswers(initialAnswers(fields));
    setRunState("idle");
    setResult(undefined);
    setComputed({});
    setError(null);
    setStepId(tool.steps?.[0]?.id);
    setCheckedItems([]);
  }, [fields, tool.steps]);

  const nextStep = () => {
    if (!currentStep) return;
    if (currentStep.type === "question" && !validate(currentStep.fieldKey, currentStep.required === true)) return;
    const liveComputed = tool.executionMode === "runtime" ? evaluateTool(tool, { ...answers, checkedItems, checkedCount: checkedItems.length }, tables).values : computed;
    setComputed(liveComputed);
    const next = getNextStepId(tool, currentStep.id, { ...answers, ...liveComputed, checkedItems, checkedCount: checkedItems.length });
    if (!next) return;
    setStepId(next);
    const nextStep = tool.steps?.find((step) => step.id === next);
    if (nextStep?.type === "result") void execute(answers, false, nextStep.resultKey);
  };

  if (tool.toolType === "ai") return <AiRuntime tool={tool} />;

  if (runState === "done" && result) return <ResultCard result={result} values={{ ...answers, ...computed }} onReset={reset} resetLabel={tool.uiCopy?.resetLabel || "Начать заново"} />;

  if (runState === "working") return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2d5145]" aria-hidden="true" /><p className="mt-4 font-bold text-[#1f2c41]">{tool.uiCopy?.loadingLabel || "Выполняем сценарий…"}</p></div>;

  return (
    <div className="grid gap-6">
      {tool.steps?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          {currentStep ? <><div className="mb-6 flex items-center justify-between gap-4"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#a98a4f]">Шаг {tool.steps.findIndex((step) => step.id === currentStep.id) + 1} из {tool.steps.length}</span><button type="button" onClick={reset} className="text-xs font-bold text-slate-500 underline">Сбросить</button></div><h2 className="text-2xl font-extrabold tracking-tight text-[#1f2c41]">{currentStep.title}</h2><StepBody step={currentStep} answers={answers} computed={computed} /><CalculationValue step={currentStep} computed={computed} />{currentStep.type === "question" && currentStep.fieldKey ? <ToolField field={fields.find((field) => field.key === currentStep.fieldKey) ?? { key: currentStep.fieldKey, label: currentStep.fieldKey, type: "text" as const }} value={answers[currentStep.fieldKey]} onChange={(value) => setAnswer(currentStep.fieldKey!, value)} /> : null}{currentStep.type === "checklist" ? <ChecklistStep step={currentStep} answers={answers} computed={computed} checkedItems={checkedItems} onToggle={(key, checked) => setCheckedItems((current) => checked ? [...current, key] : current.filter((itemKey) => itemKey !== key))} /> : null}{currentStep.type === "result" && !result ? <button type="button" onClick={() => void execute(answers, false, currentStep.resultKey)} className="button-primary mt-6">{tool.uiCopy?.calculateLabel || "Рассчитать результат"}</button> : null}{currentStep.type !== "result" && currentStep.type !== "cta" ? <button type="button" onClick={nextStep} className="button-primary mt-6">{tool.uiCopy?.nextLabel || "Дальше"}</button> : null}{currentStep.type === "cta" ? <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={nextStep} className="button-primary">{tool.uiCopy?.resultLabel || "Продолжить"}</button><Link href="/pathways" className="button-secondary inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Все инструкции</Link></div> : null}</> : null}
        </div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); void execute(); }} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="grid gap-5">{fields.map((field) => <ToolField key={field.key} field={field} value={answers[field.key]} onChange={(value) => setAnswer(field.key, value)} />)}</div>
          {error ? <p className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}</p> : null}
          <button type="submit" className="button-primary mt-7">{tool.uiCopy?.calculateLabel || "Рассчитать"}</button>
        </form>
      )}
      {tool.steps?.length && error ? <p className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}</p> : null}
      {Object.keys(computed).length > 0 && !result ? <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-extrabold text-[#1f2c41]">{tool.uiCopy?.resultLabel || "Расчёт"}</h2><dl className="mt-4 grid gap-2 text-sm">{Object.entries(computed).map(([key, value]) => <div key={key} className="flex justify-between gap-4 border-b border-slate-100 py-2"><dt className="text-slate-500">{tool.formulas?.find((formula) => formula.key === key)?.label || key}</dt><dd className="font-bold text-[#1f2c41]">{Array.isArray(value) ? value.join(", ") : String(value)}</dd></div>)}</dl></div> : null}
    </div>
  );
}
