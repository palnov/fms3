# FMS3

Информационный портал о миграции в Россию: SEO-материалы в MDX, интерактивные инструменты, лид-формы и RAG-консультант на базе официальных документов.

## Стек

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4 и MDX
- SQLite (`better-sqlite3`) для локальной базы знаний
- OpenRouter для embeddings и генерации ответов

## Локальный запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Для работы ИИ-консультанта нужны `JWT_SECRET`, `RATE_LIMIT_SECRET`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` и подготовленный `knowledge.db`. Для отправки лидов нужны `PRAVOVED_REFERRAL_ID` и `PRAVOVED_SECRET`.

## Команды

```bash
npm run dev       # локальная разработка
npm run lint      # ESLint
npm run build     # production build
npm run start     # запуск production build
```

## Основные разделы

- `src/app/pathways` — SEO-руководства и миграционные сценарии.
- `src/app/tools` — консультант, калькуляторы и проверка документов.
- `src/app/api/consultant` — RAG API консультанта.
- `knowledge.db` и `public/downloads` — runtime-метаданные и локальные документы базы знаний.
