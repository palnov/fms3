import type { Metadata } from "next";
import ArticleLayout from "@/components/mdx/ArticleLayout";
export const metadata: Metadata = {
  title: "Депортация и выдворение: в чём разница",
  description: "Чем отличаются депортация, административное выдворение, запрет на въезд и нежелательность пребывания в России.",
  alternates: { canonical: "/legal/deportation" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <ArticleLayout>{children}</ArticleLayout>; }
