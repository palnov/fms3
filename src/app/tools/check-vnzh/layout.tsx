import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка готовности ВНЖ онлайн",
  description: "Проверить статус готовности вида на жительство (ВНЖ) в Российской Федерации.",
  alternates: { canonical: "/tools/check-vnzh" },
};

export default function CheckVnzhLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="tool-page">{children}</div>;
}
