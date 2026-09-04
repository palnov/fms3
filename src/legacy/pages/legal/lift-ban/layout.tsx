import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";
export const metadata: Metadata = {
  title: "Как снять запрет на въезд в Россию в 2026 году",
  description: "Как получить решение и обжаловать запрет на въезд: МВД, суд, сроки, семейные обстоятельства и необходимые доказательства.",
  alternates: { canonical: "/legal/lift-ban" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }
