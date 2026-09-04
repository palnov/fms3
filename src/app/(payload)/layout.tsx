import { RootLayout } from "@payloadcms/next/layouts";
import configPromise from "@payload-config";
import "@payloadcms/next/css";
import { handlePayloadServerFunctions } from "@/payload/handle-server-functions";

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={configPromise} serverFunction={handlePayloadServerFunctions}>
      {children}
    </RootLayout>
  );
}
