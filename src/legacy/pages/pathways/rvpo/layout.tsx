import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";

export const metadata: Metadata = {
  title: "РВПО для иностранных студентов в 2026 году",
  description: "Как получить РВПО в России: требования к вузу и очной программе, документы, срок действия, перевод, отчисление и путь к ВНЖ.",
  alternates: { canonical: "/pathways/rvpo" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }

