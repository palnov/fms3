import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Миграционные калькуляторы",
  description: "Онлайн-калькуляторы сроков пребывания и стоимости патента для иностранных граждан.",
};

export default function CalculatorsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
