import type { Metadata } from 'next';
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Как переехать в Россию в 2026 году: РВП, ВНЖ и документы",
  description: "Пошаговое руководство по переезду в РФ. Как получить квоту, РВП, ВНЖ и гражданство России. Онлайн-калькуляторы, чек-листы и актуальные законы 2026 года.",
};

export default function Home() {
  return <HomeClient />;
}

