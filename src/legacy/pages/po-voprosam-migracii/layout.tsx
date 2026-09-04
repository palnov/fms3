import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";

export const metadata: Metadata = {
  title: "УФМС, ФМС, ГУВМ МВД и служба по вопросам миграции",
  description:
    "Как менялись миграционные органы России: УФМС, ФМС, ГУВМ МВД и современная служба по вопросам гражданства и регистрации иностранных граждан.",
  alternates: { canonical: "/po-voprosam-migracii" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ArticleLayout>{children}</ArticleLayout>;
}
