import type { Metadata } from 'next';
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Как переехать в Россию в 2026 году: РВП, ВНЖ и документы",
  description: "Пошаговое руководство по переезду в Российскую Федерацию. Узнайте, как получить квоту, РВП, вид на жительство и гражданство РФ. Онлайн-калькулятор шансов и актуальные законы 2026 года.",
};

export default function Home() {
  return <HomeClient />;
}

