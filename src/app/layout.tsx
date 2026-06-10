import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import FloatingLawyerWidget from "@/components/widgets/FloatingLawyerWidget";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fms3.ru"),
  title: {
    default: "Миграция в Россию 2026 | ВНЖ, РВП, Гражданство",
    template: "%s | Миграция в Россию",
  },
  description: "Официальная информация, чек-листы и интерактивные инструкции по переезду в Российскую Федерацию.",
  applicationName: "Миграция в Россию",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Миграция в Россию",
    title: "Миграция в Россию 2026 | ВНЖ, РВП, Гражданство",
    description: "Официальная информация, чек-листы и интерактивные инструкции по переезду в Российскую Федерацию.",
  },
  twitter: {
    card: "summary",
    title: "Миграция в Россию 2026",
    description: "Инструкции по РВП, ВНЖ, гражданству и переезду в Россию.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
        <Header />
        <main className="flex-grow flex flex-col">{children}</main>
        <FloatingLawyerWidget />
      </body>
    </html>
  );
}
