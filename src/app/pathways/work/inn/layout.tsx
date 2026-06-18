import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";
export const metadata: Metadata = {
  title: "Как получить ИНН иностранному гражданину",
  description: "Получение ИНН иностранцем в России: проверка номера, документы, заявление в ФНС и исправление персональных данных.",
  alternates: { canonical: "/pathways/work/inn" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }
