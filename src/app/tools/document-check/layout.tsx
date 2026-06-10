import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка миграционных документов",
  description: "Инструменты проверки паспорта, патента и ограничений на въезд в Российскую Федерацию.",
};

export default function DocumentCheckLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
