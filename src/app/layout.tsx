import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingLawyerWidget from "@/components/widgets/FloatingLawyerWidget";
import SiteMotion from "@/components/motion/SiteMotion";
import { AIChatProvider } from "@/components/chat/AIChatProvider";

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
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');

            ym(47198382, 'init', {webvisor:true, clickmap:true, referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://mc.yandex.ru/watch/47198382" style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
        <a className="skip-link" href="#main-content">Перейти к содержанию</a>
        <AIChatProvider>
          <Header />
          <main id="main-content" className="flex-grow flex flex-col">{children}</main>
          <Footer />
          <FloatingLawyerWidget />
          <SiteMotion />
        </AIChatProvider>
      </body>
    </html>
  );
}
