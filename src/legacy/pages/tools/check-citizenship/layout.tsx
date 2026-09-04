import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка готовности гражданства РФ онлайн",
  description: "Проверить статус готовности и принятия решения по гражданству Российской Федерации.",
  alternates: { canonical: "/tools/check-citizenship" },
};

export default function CheckCitizenshipLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="tool-page">{children}</div>;
}
