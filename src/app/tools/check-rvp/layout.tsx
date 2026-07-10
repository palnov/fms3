import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка готовности РВП онлайн",
  description: "Проверьте статус готовности разрешения на временное проживание (РВП) в Российской Федерации.",
  alternates: { canonical: "/tools/check-rvp" },
};

export default function CheckRvpLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="tool-page">{children}</div>;
}
