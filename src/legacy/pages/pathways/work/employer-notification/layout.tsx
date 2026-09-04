import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";

export const metadata: Metadata = {
  title: "Уведомление МВД о приёме иностранца в 2026 году",
  description: "Как работодателю уведомить МВД о заключении или расторжении договора с иностранцем: срок 3 рабочих дня, форма и штрафы.",
  alternates: { canonical: "/pathways/work/employer-notification" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }

