import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Медкомиссия на РВП в 2026 году",
  description: "Где пройти медкомиссию для РВП, какие обследования нужны, как выбрать уполномоченную клинику и проверить срок справок.",
  alternates: { canonical: "/pathways/rvp/medical-exam" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
