import { RootLayout } from "@payloadcms/next/layouts";
import configPromise from "@payload-config";
import "@payloadcms/next/css";
import localFont from "next/font/local";
import { handlePayloadServerFunctions } from "@/payload/handle-server-functions";
import { importMap } from "./cms/importMap";

const golos = localFont({
  src: [
    { path: "../(site)/fonts/golos-text-400.ttf", weight: "400", style: "normal" },
    { path: "../(site)/fonts/golos-text-600.ttf", weight: "600", style: "normal" },
    { path: "../(site)/fonts/golos-text-700.ttf", weight: "700", style: "normal" },
    { path: "../(site)/fonts/golos-text-800.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-golos",
  display: "swap",
});

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={handlePayloadServerFunctions}>
      <div className={golos.variable}>{children}</div>
    </RootLayout>
  );
}
