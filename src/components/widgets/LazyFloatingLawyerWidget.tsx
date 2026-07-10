"use client";

import dynamic from "next/dynamic";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

const FloatingLawyerWidget = dynamic(() => import("@/components/widgets/FloatingLawyerWidget"), {
  ssr: false,
});

export default function LazyFloatingLawyerWidget() {
  const [loaded, setLoaded] = useState(false);

  if (loaded) return <FloatingLawyerWidget initiallyOpen />;

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center gap-2 rounded-xl bg-[#ff2e32] text-white shadow-[0_14px_36px_rgba(31,44,65,.18)] transition-colors hover:bg-[#d92327] sm:w-auto sm:px-4"
      aria-label="Задать вопрос ИИ"
    >
      <MessageSquare className="h-5 w-5" />
      <span className="hidden text-sm font-extrabold sm:inline">Задать вопрос</span>
    </button>
  );
}
