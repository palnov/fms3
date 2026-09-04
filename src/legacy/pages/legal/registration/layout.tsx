import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";
export const metadata: Metadata = {
  title: "Миграционный учёт иностранных граждан в 2026 году",
  description: "Как поставить иностранца на миграционный учёт: принимающая сторона, сроки, документы, способы подачи и ответственность.",
  alternates: { canonical: "/legal/registration" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }
