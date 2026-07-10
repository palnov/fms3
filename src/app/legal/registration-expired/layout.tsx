import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";

export const metadata: Metadata = {
  title: "Просрочена миграционная регистрация: штраф и действия",
  description: "Что делать при просроченной регистрации иностранца: определить нарушение, восстановить учёт, подготовить доказательства и оценить риск выдворения.",
  alternates: { canonical: "/legal/registration-expired" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }

