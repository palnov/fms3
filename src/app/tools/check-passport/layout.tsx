import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка действительности паспорта РФ онлайн",
  description: "Проверить паспорт гражданина РФ на действительность в базе данных МВД РФ.",
  alternates: { canonical: "/tools/check-passport" },
};

export default function CheckPassportLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="tool-page">{children}</div>;
}
