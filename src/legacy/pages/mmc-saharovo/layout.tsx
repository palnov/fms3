import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";

export const metadata: Metadata = {
  title: "Миграционный центр Сахарово: адрес, услуги, документы и цены",
  description:
    "Подробный справочник по ММЦ Сахарово: где находится миграционный центр Москвы, как добраться, режим работы, патент, РВП, ВНЖ, гражданство, документы, парковка и официальные ссылки.",
  alternates: { canonical: "/mmc-saharovo" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArticleLayout>{children}</ArticleLayout>;
}
