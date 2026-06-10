import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ИИ-консультант по миграции",
  description: "Ответы по РВП, ВНЖ, гражданству и миграционным документам на основе базы официальных источников.",
};

export default function AIConsultantLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
