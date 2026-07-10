import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проверка готовности патента на работу онлайн",
  description: "Проверить статус готовности и оформление трудового патента иностранного гражданина в РФ.",
  alternates: { canonical: "/tools/check-patent" },
};

export default function CheckPatentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="tool-page">{children}</div>;
}
