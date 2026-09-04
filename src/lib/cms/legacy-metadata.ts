import type { Metadata } from "next";
import { articles } from "@/lib/articles";

const STATIC_METADATA: Record<string, Metadata> = {
  "/": {
    title: { absolute: "Как жить и работать в России законно — РВП, ВНЖ, гражданство" },
    description: "Понятные инструкции для иностранных граждан: переезд в Россию, РВП, ВНЖ, гражданство, работа, документы, сроки и онлайн-проверки.",
    alternates: { canonical: "/" },
  },
  "/pathways": {
    title: "Все пути легализации в России",
    description: "Сравните РВП, ВНЖ, гражданство, патент и программу переселения. Выберите подходящий маршрут и перейдите к пошаговой инструкции.",
    alternates: { canonical: "/pathways" },
  },
  "/privacy": {
    title: "Конфиденциальность и обработка данных",
    description: "Как Миграционный справочник обрабатывает обращения, диалоги с ИИ и аналитические данные.",
    alternates: { canonical: "/privacy" },
  },
  "/editorial-policy": {
    title: "Редакционная политика и источники",
    description: "Как Миграционный справочник проверяет сроки, суммы и требования по официальным источникам и исправляет материалы.",
    alternates: { canonical: "/editorial-policy" },
  },
  "/karta-sayta": {
    title: "Карта сайта",
    description: "Все инструкции и сервисы Миграционного справочника: ВНЖ, РВП, гражданство, работа, проверки и миграционные риски.",
    alternates: { canonical: "/karta-sayta" },
  },
  "/tools/ai-consultant": { title: "ИИ-консультант по миграции", description: "Ответы по РВП, ВНЖ, гражданству и миграционным документам на основе базы официальных источников.", alternates: { canonical: "/tools/ai-consultant" } },
  "/tools/calculators": { title: "Миграционные калькуляторы", description: "Онлайн-калькуляторы сроков пребывания и стоимости патента для иностранных граждан.", alternates: { canonical: "/tools/calculators" } },
  "/tools/check-citizenship": { title: "Проверка готовности гражданства РФ онлайн", description: "Проверить статус готовности и принятия решения по гражданству Российской Федерации.", alternates: { canonical: "/tools/check-citizenship" } },
  "/tools/check-passport": { title: "Проверка действительности паспорта РФ онлайн", description: "Проверить паспорт гражданина РФ на действительность в базе данных МВД РФ.", alternates: { canonical: "/tools/check-passport" } },
  "/tools/check-patent": { title: "Проверка готовности патента на работу онлайн", description: "Проверить статус готовности и оформление трудового патента иностранного гражданина в РФ.", alternates: { canonical: "/tools/check-patent" } },
  "/tools/check-rvp": { title: "Проверка готовности РВП онлайн", description: "Проверьте статус готовности разрешения на временное проживание (РВП) в Российской Федерации.", alternates: { canonical: "/tools/check-rvp" } },
  "/tools/check-vnzh": { title: "Проверка готовности ВНЖ онлайн", description: "Проверить статус готовности вида на жительство (ВНЖ) в Российской Федерации.", alternates: { canonical: "/tools/check-vnzh" } },
  "/tools/checklist-generator": { title: "Чек-лист миграционных документов онлайн", description: "Соберите персональный список документов для РВП, ВНЖ, гражданства или патента и отмечайте готовность каждого пункта.", alternates: { canonical: "/tools/checklist-generator" } },
  "/tools/document-check": { title: "Проверка миграционных документов", description: "Инструменты проверки паспорта, патента и ограничений на въезд в Российскую Федерацию.", alternates: { canonical: "/tools/document-check" } },
  "/tools/path-finder": { title: "Какой миграционный статус выбрать: онлайн-навигатор", description: "Подберите путь к РВП, ВНЖ, гражданству или патенту по гражданству, семье, образованию и работе в России.", alternates: { canonical: "/tools/path-finder" } },
};

export function getLegacyMetadata(path: string): Metadata | undefined {
  if (STATIC_METADATA[path]) return STATIC_METADATA[path];
  const article = articles.find((entry) => entry.href === path);
  return article ? { title: article.title, description: article.description, alternates: { canonical: path } } : undefined;
}
