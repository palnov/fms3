import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ИИ-консультант по миграции",
  description: "Ответы по РВП, ВНЖ, гражданству и миграционным документам на основе базы официальных источников.",
  alternates: { canonical: "/tools/ai-consultant" },
};

export default function AIConsultantLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="tool-page">{children}</div>;
}
