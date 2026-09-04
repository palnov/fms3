import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Миграционные калькуляторы",
  description: "Онлайн-калькуляторы сроков пребывания и стоимости патента для иностранных граждан.",
  alternates: { canonical: "/tools/calculators" },
};

export default function CalculatorsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="tool-page">{children}</div>;
}
