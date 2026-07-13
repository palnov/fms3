"use client";

import dynamic from "next/dynamic";
import { MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const FloatingLawyerWidget = dynamic(() => import("@/components/widgets/FloatingLawyerWidget"), {
  ssr: false,
});

export default function LazyFloatingLawyerWidget() {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  if (loaded) return <FloatingLawyerWidget initiallyOpen />;

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className={`floating-assistant-trigger fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center gap-2 sm:w-auto sm:px-4 ${pathname === "/" ? "floating-assistant-trigger-home" : ""}`}
      aria-label="Задать вопрос ИИ"
    >
      <MessageSquare className="h-5 w-5" />
      <span className="hidden text-sm font-extrabold sm:inline">Задать вопрос</span>
    </button>
  );
}
