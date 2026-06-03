# SEO Архитектура и семантическое ядро (Expanded 2026)

Структура сформирована согласно алгоритму `find-keywords` с учетом интента, каннибализации и разбивки на 3 уровня (Tier 1 - Head, Tier 2 - Body, Tier 3 - Long-tail).

## Сводка по нише
- **Domain Focus**: Портал легализации иностранных граждан в РФ.
- **Conversion Goal**: Привлечение органического трафика на интерактивные инструменты (Калькулятор, Чек-листы), рециркуляция через внутренние ссылки, возможная монетизация через юристов-партнеров.
- **Top Competitors**: Сайты частных юридических клиник, информационные порталы (Мигрон, Вестник Мигранта), государственные сайты с плохим UX.
- **Уязвимость конкурентов**: Мало интерактивного E-E-A-T контента, сложный язык, устаревший дизайн.

---

## 1. Priority Matrix (Кластеры и Ключи)

### Cluster 0: Навигационный HUB (Главная страница)
**Pillar Keyword**: `как переехать в россию 2026`, `помощь мигрантам`, `миграционный портал`
**Route**: `/`
**Intent**: Informational / Navigational

### Cluster 1: ВНЖ (Вид на жительство)
Ядро трафика. Максимальная конверсия в долгие сессии.

| Keyword | Est. Vol & Diff | Intent | Tier | Route | Content Type |
|---------|-----------------|--------|------|-------|--------------|
| внж в россии 2026 | High / Hard | Informational | 1 | `/pathways/vnzh/` | Pillar Guide |
| документы на внж список 2026 | High / Med | Informational | 2 | `/pathways/vnzh/documents` | Checklist / Guide |
| внж по браку 2026 | High / Med | Informational | 2 | `/pathways/vnzh/by-marriage` | Step-by-step |
| кто может получить внж без рвп | Med / Low | Informational | 3 | `/pathways/vnzh/without-rvp` | Explainer + Calculator link |
| внж для граждан казахстана | Med / Low | Informational | 3 | `/pathways/vnzh/kazakhstan` | Targeted Guide |
| уведомление о проживании по внж | High / Med | Transactional | 2 | `/pathways/vnzh/notification` | Utility page + Blank download |
| проверка готовности внж мвд | High / Low | Navigational | 2 | `/pathways/vnzh/status-check` | Frame / Link to MVD |

### Cluster 2: РВП (Разрешение на врем. проживание)
Огромный объем болей (квоты).

| Keyword | Est. Vol & Diff | Intent | Tier | Route | Content Type |
|---------|-----------------|--------|------|-------|--------------|
| рвп в россии 2026 | High / Hard | Informational | 1 | `/pathways/rvp/` | Pillar Guide |
| квота на рвп 2026 | High / Med | Informational | 2 | `/pathways/rvp/quota` | Strategy Guide |
| заявление на рвп новый бланк | Med / Low | Transactional | 3 | `/pathways/rvp/application-form` | Gated resource (PDF) |
| рвп по браку новые правила | High / Med | Informational | 2 | `/pathways/rvp/marriage` | Guide w/ alerts on 2026 laws |
| медкомиссия на рвп | Med / Med | Commercial | 2 | `/pathways/rvp/medical-exam` | Info / Map integration |

### Cluster 3: Гражданство РФ
Высшая ступень, много изменений в законодательстве.

| Keyword | Est. Vol & Diff | Intent | Tier | Route | Content Type |
|---------|-----------------|--------|------|-------|--------------|
| как получить гражданство рф | High / Hard | Informational | 1 | `/pathways/citizenship/` | Ultimate Guide |
| закон о гражданстве рф 2024 / 2026 | High / Med | Informational | 2 | `/pathways/citizenship/new-law` | Explainer / News block |
| гражданство рф в упрощенном порядке | High / Med | Informational | 2 | `/pathways/citizenship/simplified` | Guide |
| гражданство для белорусов 2026 | Med / Low | Informational | 3 | `/pathways/citizenship/belarus` | Niche Guide |
| присяга гражданина рф текст | Low / Low | Informational | 3 | `/pathways/citizenship/oath` | Snippet Target |

### Cluster 4: Трудовая локализация (Патент и ВКС)
Для тех, кто приехал на заработки.

| Keyword | Est. Vol & Diff | Intent | Tier | Route | Content Type |
|---------|-----------------|--------|------|-------|--------------|
| патент на работу для иностранных | High / Hard | Commercial | 1 | `/pathways/work/patent` | Pillar Guide |
| как оплатить патент на работу | High / Med | Transactional | 2 | `/pathways/work/patent/payment` | How-to |
| внж для вкс 2026 | Med / Low | Informational | 2 | `/pathways/work/vks` | Explainer |
| как сделать инн иностранному гражданину | Med / Low | Informational | 3 | `/pathways/work/inn` | Quick Guide |

### Cluster 5: Легальность и Запреты (Pain-point Cluster)
Высочайшая эмоциональная вовлеченность (страх депортации).

| Keyword | Est. Vol & Diff | Intent | Tier | Route | Content Type |
|---------|-----------------|--------|------|-------|--------------|
| проверить запрет на въезд в рф | Massive / Med | Transactional | 1 | `/services/check-ban` | Tool / Link |
| депортация и выдворение разница | Med / Low | Informational | 3 | `/legal/deportation` | Educational |
| как снять запрет на въезд в россию | High / Hard | Commercial | 2 | `/legal/lift-ban` | Guide |
| миграционный учет иностранных | High / Med | Informational | 2 | `/legal/registration` | Step-by-step |

### Cluster 6: Интерактивные Инструменты (Наши магниты)
Сюда ссылаемся из КАЖДОЙ статьи для удержания ПФ.

| Keyword (Hidden Intent) | Intent | Tier | Route | Component/App |
|-------------------------|--------|------|-------|---------------|
| "основания для внж онлайн", "как лучше переехать" | Transactional | 1 | `/tools/calculator` | Migration Path Finder Quiz |
| "тесты для мигрантов онлайн", "экзамен пвс" | Informational | 1 | `/tools/exam` | Exam Auth Simulator |
| "список документов рвп pdf" | Transactional | 2 | `/tools/checklists` | Dynamic Checklist Generator |

---

## 2. Стратегия Внутренней Перелинковки (Silo)

- **Top-Down**: Главная страница ссылается на Pillar-страницы (ВНЖ, РВП, Гражданство).
- **Bottom-Up**: Каждая статья Tier 3 обильно ссылается на Pillar-страницу обобщенного ключа для передачи веса.
- **Cross-Link**: В статьях про РВП обязательно размещается блок "Что дальше? Узнайте как получить ВНЖ".
- **CTA-Injection**: Во все страницы Tier 1 и 2 встраиваются React-компоненты (баннеры), призывающие открыть `/tools/calculator`.

## 3. SEO-оптимизация контента (Ruleset)

1. **SERP Features**: Во всех статьях внедрять H2 "Частые вопросы" с параграфами по 45-50 слов для захвата *Featured Snippets* (Нулевая выдача).
2. **E-E-A-T Сигналы**: В статьях использовать сноски вида `[Согласно п. 2 ст. 8 ФЗ-115 "О правовом положении..."]` для доказательства компетентности.
3. **URL Structure**: Короткие URL-адреса на английском без спецсимволов.
4. **No Cannibalization**: Строго разделять "документы для ВНЖ" и "документы для РВП" в разные директории, чтобы поисковик не путался.
