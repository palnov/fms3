import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";
export const metadata: Metadata = {
  title: "Высококвалифицированный специалист в России 2026",
  description: "Как оформляется ВКС: требования к работодателю и зарплате, разрешение на работу, ВНЖ специалиста и членов семьи.",
  alternates: { canonical: "/pathways/work/vks" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }
