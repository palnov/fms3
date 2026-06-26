import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";

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
            value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
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

export default withMDX(nextConfig);
