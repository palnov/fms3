import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Чек-лист миграционных документов онлайн",
  description: "Соберите персональный список документов для РВП, ВНЖ, гражданства или патента и отмечайте готовность каждого пункта.",
  alternates: { canonical: "/tools/checklist-generator" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }

