import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import FloatingLawyerWidget from "@/components/widgets/FloatingLawyerWidget";
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Миграция в Россию 2026 | ВНЖ, РВП, Гражданство",
  description: "Официальная информация, чек-листы и интерактивные инструкции по переезду в Российскую Федерацию.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
        <Header />
        <main className="flex-grow flex flex-col">{children}</main>
        <FloatingLawyerWidget />
      </body>
    </html>
  );
}
