import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingLawyerWidget from "@/components/widgets/FloatingLawyerWidget";

const golos = localFont({
  src: [
    { path: "./fonts/golos-text-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/golos-text-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/golos-text-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/golos-text-800.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-golos",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fms3.ru"),
  title: {
    default: "Миграционный справочник | ВНЖ, РВП и гражданство России",
    template: "%s | Миграционный справочник",
  },
  description: "Понятные инструкции по ВНЖ, РВП, гражданству и работе в России: документы, сроки, изменения законодательства и интерактивные инструменты.",
  applicationName: "Миграционный справочник",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Миграционный справочник",
    title: "Миграционный справочник",
    description: "Инструкции, документы и сервисы для легального проживания и работы в России.",
  },
  twitter: {
    card: "summary",
    title: "Миграционный справочник",
    description: "Инструкции по РВП, ВНЖ, гражданству и работе в России.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${golos.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main-content">Перейти к содержанию</a>
        <Header />
        <main id="main-content" className="flex-grow flex flex-col">{children}</main>
        <Footer />
        <FloatingLawyerWidget />
      </body>
    </html>
  );
}
