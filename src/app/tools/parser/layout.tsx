import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Парсер базы знаний",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ParserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
