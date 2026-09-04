import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка миграционных документов",
  description: "Инструменты проверки паспорта, патента и ограничений на въезд в Российскую Федерацию.",
  alternates: { canonical: "/tools/document-check" },
};

export default function DocumentCheckLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="tool-page">{children}</div>;
}
