"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

const COUNTER_ID = 47198382;
const STORAGE_KEY = "fms3_analytics_preference";
const PREFERENCE_EVENT = "fms3:analytics-preference";

type Preference = "accepted" | "declined";
type YmFunction = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

declare global {
  interface Window {
    ym?: YmFunction;
    disableYaCounter47198382?: boolean;
  }
}

function ensureMetrika() {
  window.disableYaCounter47198382 = false;
  if (!window.ym) {
    const ym: YmFunction = (...args: unknown[]) => {
      (ym.a ||= []).push(args);
    };
    ym.l = Date.now();
    window.ym = ym;
  }

  if (!document.querySelector('script[data-fms3-metrika="true"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    script.dataset.fms3Metrika = "true";
    document.head.appendChild(script);
  }

  window.ym?.(COUNTER_ID, "init", {
    webvisor: true,
    clickmap: true,
    referrer: document.referrer,
    url: window.location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
}

function disableMetrika() {
  window.ym?.(COUNTER_ID, "destruct");
  window.disableYaCounter47198382 = true;
}

export function setAnalyticsPreference(preference: Preference) {
  window.localStorage.setItem(STORAGE_KEY, preference);
  if (preference === "declined") disableMetrika();
  else ensureMetrika();
  window.dispatchEvent(new CustomEvent(PREFERENCE_EVENT, { detail: preference }));
}

function getPreferenceSnapshot(): Preference | null {
  const current = window.localStorage.getItem(STORAGE_KEY);
  return current === "accepted" || current === "declined" ? current : null;
}

function subscribeToPreference(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(PREFERENCE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(PREFERENCE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function useAnalyticsPreference() {
  return useSyncExternalStore(subscribeToPreference, getPreferenceSnapshot, () => null);
}

export function AnalyticsControls() {
  const preference = useAnalyticsPreference();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="button-primary" onClick={() => setAnalyticsPreference("accepted")}>Разрешить аналитику</button>
      <button type="button" className="button-secondary" onClick={() => setAnalyticsPreference("declined")}>Отключить аналитику</button>
      <span className="text-sm text-[#667287]" aria-live="polite">
        {preference === "declined" ? "Аналитика отключена" : preference === "accepted" ? "Аналитика разрешена" : "Выбор ещё не сохранён"}
      </span>
    </div>
  );
}

export default function AnalyticsManager() {
  const preference = useAnalyticsPreference();

  useEffect(() => {
    const storedPreference = getPreferenceSnapshot();
    if (storedPreference === "declined") disableMetrika();
    else ensureMetrika();
  }, [preference]);

  if (preference) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-3xl rounded-2xl border border-[#d8dee7] bg-white p-4 shadow-2xl" aria-label="Настройки аналитики">
      <p className="text-sm leading-relaxed text-[#4f5c70]">
        Мы используем Яндекс Метрику и Webvisor для улучшения сайта. Аналитика уже включена; вы можете отключить её сейчас или позже в <Link href="/privacy" className="font-bold text-[#02629f] underline">настройках конфиденциальности</Link>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="button-primary" onClick={() => setAnalyticsPreference("accepted")}>Оставить включённой</button>
        <button type="button" className="button-secondary" onClick={() => setAnalyticsPreference("declined")}>Отключить</button>
      </div>
    </aside>
  );
}
