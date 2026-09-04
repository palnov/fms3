import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ежегодное уведомление по ВНЖ в 2026 году",
  description: "Когда и как подавать уведомление о подтверждении проживания по ВНЖ: сроки, доход, документы, почтовая и личная подача.",
  alternates: { canonical: "/pathways/vnzh/notification" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
