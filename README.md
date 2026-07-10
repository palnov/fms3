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

Для работы ИИ-консультанта нужны Redis, `JWT_SECRET`, `RATE_LIMIT_SECRET`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` и подготовленный `knowledge.db`. Для админ-журнала нужен `ADMIN_SECRET`. Для отправки лидов нужны `PRAVOVED_REFERRAL_ID` и `PRAVOVED_SECRET`.

## Команды

```bash
npm run dev       # локальная разработка
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run test      # unit/integration tests
npm run build     # production build
npm run start     # запуск production build
npm run test:e2e  # Playwright после production build
npm run check     # lint + types + tests + build
```

## Основные разделы

- `src/app/pathways` — SEO-руководства и миграционные сценарии.
- `src/app/tools` — консультант, калькуляторы и проверка документов.
- `src/app/api/consultant` — RAG API консультанта.
- `knowledge.db` и `public/downloads` — runtime-метаданные и локальные документы базы знаний.

## Деплой в Coolify через GitHub

Проект рассчитан на автоматическую сборку Dockerfile после обновления ветки `main`. До merge рекомендуется включить branch protection и требовать успешный workflow `Quality` из GitHub Actions.

### 1. Persistent storage

Создайте в приложении Coolify persistent storage с destination path `/data`. Контейнер работает от пользователя `node` с UID/GID `1000`; каталог должен быть доступен ему на чтение и запись.

Один раз перенесите существующую базу знаний на сервер:

```text
/data/knowledge.db
```

База не входит в Git и Docker image. При её обновлении замените файл в volume атомарно: загрузите новый файл под временным именем, проверьте его и переименуйте в `knowledge.db`. Приложение обнаружит новое время модификации и обновит кэш embeddings.

Журнал диалогов создаётся автоматически:

```text
/data/ai-chat-log.db
```

Приложение должно работать в одной реплике, пока журнал хранится в SQLite.

### 2. Redis

Добавьте в тот же Coolify project отдельный Redis service с persistent storage. Передайте приложению внутренний connection URL сервиса в `REDIS_URL`. Rate limits AI, лидов и входа в админку общие для всех процессов и переживают redeploy.

### 3. Environment variables

Минимальный production-набор:

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://ufms-help.ru
NEXT_PUBLIC_PARTNER_PHONE=8 (800) 350-84-13

DATA_DIR=/data
KNOWLEDGE_DB_PATH=/data/knowledge.db
AI_CHAT_LOG_DB_PATH=/data/ai-chat-log.db
AI_CHAT_LOG_RETENTION_DAYS=60
REDIS_URL=redis://redis:6379

JWT_SECRET=<случайная строка не короче 32 символов>
RATE_LIMIT_SECRET=<другая случайная строка не короче 32 символов>
ADMIN_SECRET=<отдельная случайная строка не короче 32 символов>

OPENROUTER_API_KEY=<secret>
OPENROUTER_MODEL=deepseek/deepseek-v4-flash
PRAVOVED_REFERRAL_ID=<id>
PRAVOVED_SECRET=<secret>
```

Не используйте одинаковое значение для трёх локальных secrets.

### 4. Healthcheck

Docker image проверяет `http://127.0.0.1:3000/api/health`. Ответ `200` означает, что Redis доступен и `knowledge.db` читается. Ответ `503` не раскрывает credentials или внутренние адреса. Статические страницы могут продолжать работать при деградации AI-зависимостей.

### 5. Backup и rollback

- Храните исходную копию `knowledge.db` вне контейнера.
- Регулярно копируйте `/data/ai-chat-log.db`, если журнал нужен для поддержки.
- Откат кода выполняется стандартным rollback deployment в Coolify и не должен заменять volume.
- Перед заменой базы сохраните предыдущий файл, чтобы откат данных не зависел от отката Docker image.
