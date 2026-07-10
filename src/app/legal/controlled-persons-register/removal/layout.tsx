import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Как исключить себя из реестра контролируемых лиц",
  description: "Порядок исключения из реестра МВД: выяснение основания, заявление, доказательства законного статуса, исправление ошибки и обжалование.",
  alternates: { canonical: "/legal/controlled-persons-register/removal" },
};

export default function Layout({ children }: { children: React.ReactNode }) { return children; }

