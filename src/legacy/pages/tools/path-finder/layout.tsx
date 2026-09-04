import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Какой миграционный статус выбрать: онлайн-навигатор",
  description: "Подберите путь к РВП, ВНЖ, гражданству или патенту по гражданству, семье, образованию и работе в России.",
  alternates: { canonical: "/tools/path-finder" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <div className="tool-page">{children}</div>; }
