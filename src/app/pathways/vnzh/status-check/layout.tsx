import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверить готовность ВНЖ: официальный порядок 2026",
  description: "Как проверить готовность вида на жительство через официальный сервис МВД, почему нет данных и что делать при задержке решения.",
  alternates: { canonical: "/pathways/vnzh/status-check" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
