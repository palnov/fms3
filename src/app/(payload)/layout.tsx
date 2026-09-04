import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import configPromise from "@payload-config";
import "@payloadcms/next/css";

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={configPromise} serverFunction={handleServerFunctions}>
      {children}
    </RootLayout>
  );
}
