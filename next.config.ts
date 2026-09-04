import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withPayload } from "@payloadcms/next/withPayload";
import remarkGfm from "remark-gfm";

const isDev = process.env.NODE_ENV === "development";
const feedotConnectSources = [
  "https://widget.info-app5shs.ru",
  "https://config.widget.info-app5shs.ru",
  "https://dialog.chat.info-app5shs.ru",
  "https://leads-reception.info-app5shs.ru",
  "https://api.info-app5shs.ru",
  "https://geo-db.info-app5shs.ru",
  "https://d.my.feedot.com",
  "https://clarification.info-app5shs.ru",
  "https://receiver.pravoved.org",
  "https://feedot.statsget.com",
  "https://classification.info-app5shs.ru",
  "https://api-text-models-feedot.eu.app-raise.org",
  "https://runtry.servicetory.com",
];
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://mc.yandex.ru https://mc.yandex.com https://yastatic.net ${feedotConnectSources[0]} ${feedotConnectSources[1]}`,
  `style-src 'self' 'unsafe-inline' https://*.info-app5shs.ru`,
  `img-src 'self' data: blob: https://mc.yandex.ru https://mc.yandex.com https://*.info-app5shs.ru https://*.feedot.com https://*.pravoved.org`,
  "font-src 'self' data: https://*.info-app5shs.ru",
  `connect-src 'self' https://mc.yandex.ru https://mc.yandex.com https://*.webvisor.com wss://*.webvisor.com ${feedotConnectSources.join(" ")}`,
  `frame-src 'self' https://*.webvisor.com https://mc.yandex.ru https://mc.yandex.com https://*.info-app5shs.ru`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  serverExternalPackages: ["pdf-parse"],
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/gotovnost-rvp",
        destination: "/tools/check-rvp",
        permanent: true,
      },
      {
        source: "/gotovnost-grazhdanstva",
        destination: "/tools/check-citizenship",
        permanent: true,
      },
      {
        source: "/gotovnost-vnzh",
        destination: "/pathways/vnzh/status-check",
        permanent: true,
      },
      {
        source: "/saharovo",
        destination: "/mmc-saharovo",
        permanent: true,
      },
      {
        source: "/blanki-i-obrazczy",
        destination: "/pathways/rvp/application-form",
        permanent: true,
      },
      {
        source: "/goryachaya-liniya-ufms",
        destination: "/po-voprosam-migracii",
        permanent: true,
      },
      {
        source: "/uchet/bank-ogranichil-:slug",
        destination: "/legal/check-ban",
        permanent: true,
      },
      {
        source: "/uchet/iskluchenie-iz-rkl",
        destination: "/legal/lift-ban",
        permanent: true,
      },
      {
        source: "/uvm-mvd-rf",
        destination: "/po-voprosam-migracii",
        permanent: true,
      },
      {
        source: "/vid-na-zhitelstvo/:slug*",
        destination: "/pathways/vnzh",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
  },
});

export default withPayload(withMDX(nextConfig));
