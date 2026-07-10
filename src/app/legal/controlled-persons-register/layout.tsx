import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";

export const metadata: Metadata = {
  title: "Реестр контролируемых лиц МВД: проверка и ограничения",
  description: "Кого включают в реестр контролируемых лиц, как проверить сведения МВД, какие ограничения действуют и что делать после обнаружения записи.",
  alternates: { canonical: "/legal/controlled-persons-register" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }

