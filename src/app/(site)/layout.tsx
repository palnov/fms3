import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AIChatProvider } from "@/components/chat/AIChatProvider";
import AnalyticsManager from "@/components/analytics/AnalyticsManager";
import { getSiteSettings } from "@/lib/cms/queries";
import { PARTNER_PHONE } from "@/lib/contact";

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

function safeSiteUrl(value: string | undefined) {
  try {
    return new URL(value || process.env.NEXT_PUBLIC_SITE_URL || "https://ufms-help.ru");
  } catch {
    return new URL("https://ufms-help.ru");
  }
}

function imageUrl(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "url" in value && typeof value.url === "string") return value.url;
  return undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "Миграционный справочник";
  const title = settings?.defaultTitle || `${siteName} | ВНЖ, РВП и гражданство России`;
  const description = settings?.defaultDescription || settings?.siteDescription || "Понятные инструкции по ВНЖ, РВП, гражданству и работе в России: документы, сроки, изменения законодательства и интерактивные инструменты.";
  const ogImage = imageUrl(settings?.defaultOgImage);
  const absoluteOgImage = ogImage && /^https?:\/\//i.test(ogImage) ? ogImage : ogImage ? `${safeSiteUrl(settings?.siteUrl).origin}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}` : undefined;

  return {
    metadataBase: safeSiteUrl(settings?.siteUrl),
    title: { default: title, template: `%s | ${siteName}` },
    description,
    applicationName: siteName,
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName,
      title,
      description,
      images: absoluteOgImage ? [{ url: absoluteOgImage }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();
  const siteName = siteSettings?.siteName || "Миграционный справочник";
  const partnerPhone = siteSettings?.partnerPhone || PARTNER_PHONE;
  const footerDescription = siteSettings?.organizationDescription || siteSettings?.siteDescription;

  return (
    <html lang="ru" className={`${golos.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main-content">Перейти к содержанию</a>
        <AIChatProvider>
          <Header siteName={siteName} partnerPhone={partnerPhone} />
          <main id="main-content" className="flex-grow flex flex-col">{children}</main>
          <Footer siteName={siteName} description={footerDescription} />
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
