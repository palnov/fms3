import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";

export const metadata: Metadata = {
  title: "Трудовой договор с иностранным гражданином в 2026 году",
  description: "Как оформить трудовой договор с иностранцем: документы, обязательные условия, патент или ВНЖ, уведомление МВД и ошибки работодателя.",
  alternates: { canonical: "/pathways/work/employment-contract" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }

