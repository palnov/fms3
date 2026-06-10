# FMS3

Информационный портал о миграции в Россию: SEO-материалы в MDX, интерактивные инструменты, лид-формы и RAG-консультант на базе официальных документов.

## Стек

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4 и MDX
- SQLite (`better-sqlite3`) для локальной базы знаний
- OpenRouter/Gemini для embeddings, генерации ответов и OCR

## Локальный запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Для работы ИИ-консультанта нужны `JWT_SECRET`, `OPENROUTER_API_KEY` и подготовленный `knowledge.db`. Для отправки лидов нужны `PRAVOVED_REFERRAL_ID` и `PRAVOVED_SECRET`.

## Команды

```bash
npm run dev       # локальная разработка
npm run lint      # ESLint
npm run build     # production build
npm run start     # запуск production build
npm run index-kb  # индексация базы знаний
```

## Основные разделы

- `src/app/pathways` — SEO-руководства и миграционные сценарии.
- `src/app/tools` — консультант, калькуляторы, проверка документов и внутренний парсер.
- `src/app/api/consultant` — RAG API консультанта.
- `src/app/api/parser` — загрузка, извлечение и векторизация источников.
- `knowledge` и `public/downloads` — манифесты и локальные документы базы знаний.

Парсер и векторизатор пока входят в приложение. Перед публичным размещением их необходимо защитить авторизацией либо вынести во внутренний сервис.
