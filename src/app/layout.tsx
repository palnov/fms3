import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AIChatProvider } from "@/components/chat/AIChatProvider";
import AnalyticsManager from "@/components/analytics/AnalyticsManager";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ufms-help.ru"),
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
        <AIChatProvider>
          <Header />
          <main id="main-content" className="flex-grow flex flex-col">{children}</main>
          <Footer />
          <AnalyticsManager />
        </AIChatProvider>
        <Script id="feedot-widgets-loader" strategy="afterInteractive">
          {`
            (function(f, ee, d, o, t) {
                if (ee._feedot) return;
                ee._feedot = f;
                ee._feedotStandalone = {"folder":"/2e32560face91b58d22a63208af38c92","build":"2e325","config":"60fac","settings":"532f2ec11488e9da26a317de2b0510d5","init":"173a6d6f6e4e1e464a611728a498d0aa"};

                function loadScript(src, onError) {
                    o = d.createElement('script');
                    o.src = src;
                    o.defer = true;
                    if (o.addEventListener)
                        o.addEventListener('error', onError, false);
                    else if (o.attachEvent)
                        o.attachEvent('onerror', onError);
                    d.body.appendChild(o);
                }

                t = (new Date()).getTime();
                loadScript([
                    ee._feedotStandalone.folder,
                    ee._feedotStandalone.build,
                    ee._feedotStandalone.init + '.js?t=' + t
                ].join('/'), function() {
                    ee._feedotStandalone = null;
                    loadScript('https://widget.info-app5shs.ru/js/init.js?t=' + t);
                });
            })('2e32560face91b58d22a63208af38c92', window, document);
          `}
        </Script>
      </body>
    </html>
  );
}
