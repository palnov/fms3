import { RootLayout } from "@payloadcms/next/layouts";
import configPromise from "@payload-config";
import "@payloadcms/next/css";
import { handlePayloadServerFunctions } from "@/payload/handle-server-functions";
import { importMap } from "./cms/importMap";

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={handlePayloadServerFunctions}>
      {children}
    </RootLayout>
  );
}
