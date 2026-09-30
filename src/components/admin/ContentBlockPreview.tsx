"use client";

import { useFormFields } from "@payloadcms/ui";
import type { UIFieldClientComponent } from "payload";
import type { ReactNode } from "react";
import {
  FaqAccordion,
  LegalSource,
  LinkCardGrid,
  Notice,
  QuickAnswer,
  RelatedGuide,
  Warning,
} from "@/components/mdx/ContentBlocks";
import { ConsultationBannerPreview } from "@/components/mdx/ConsultationBannerPreview";
import { renderBlockText } from "@/lib/cms/render-block-text";
import styles from "./ContentBlockPreview.module.css";

type FormFieldState = { value?: unknown; rows?: unknown[] };
type PreviewKind = "quickAnswer" | "notice" | "warning" | "legalSource";
type BlockValues = Record<string, unknown>;
type PreviewFaqItem = { question: string; answer: string };
type PreviewLinkCard = { href: string; title: string; description: string; label?: string };

function useBlockValues(path: string, keys: string[]): BlockValues {
  const blockPath = path.slice(0, path.lastIndexOf("."));
  return useFormFields(([formFields]) => {
    const fields = formFields as unknown as Record<string, FormFieldState | undefined>;
    return Object.fromEntries(keys.map((key) => [key, fields[blockPath + "." + key]?.value]));
  });
}

function useBlockRows(path: string, arrayName: string): BlockValues[] {
  const arrayPath = path.slice(0, path.lastIndexOf(".")) + "." + arrayName;
  return useFormFields(([formFields]) => {
    const fields = formFields as unknown as Record<string, FormFieldState | undefined>;
    const rows = new Map<number, BlockValues>();
    const prefix = arrayPath + ".";
    const rowCount = fields[arrayPath]?.rows?.length ?? 0;
    for (let index = 0; index < rowCount; index += 1) rows.set(index, {});

    for (const [fieldPath, state] of Object.entries(fields)) {
      if (!fieldPath.startsWith(prefix)) continue;
      const match = /^(\d+)\.([^.]+)$/.exec(fieldPath.slice(prefix.length));
      if (!match) continue;
      const index = Number(match[1]);
      const row = rows.get(index) ?? {};
      row[match[2]] = state?.value;
      rows.set(index, row);
    }

    if (rows.size > 0) return [...rows.entries()].sort(([left], [right]) => left - right).map(([, row]) => row);
    const directValue = fields[arrayPath]?.value;
    return Array.isArray(directValue) ? directValue.filter((item): item is BlockValues => isRecord(item)) : [];
  });
}

function isRecord(value: unknown): value is BlockValues {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <section className={styles.field} aria-label="Предпросмотр блока на странице">
      <p className={styles.label}>Как блок выглядит на странице</p>
      <div className={styles.canvas + " cms-block-preview"} inert aria-hidden="true">
        {children}
      </div>
    </section>
  );
}

function BlockPreview({ path, kind }: { path: string; kind: PreviewKind }) {
  const values = useBlockValues(path, ["content", "title"]);
  const content = typeof values.content === "string" ? values.content : "";
  const previewText = content.trim()
    ? renderBlockText(content)
    : <p>Текст предпросмотра появится здесь после заполнения поля.</p>;

  return (
    <PreviewFrame>
      {kind === "quickAnswer" ? <QuickAnswer>{previewText}</QuickAnswer> : null}
      {kind === "notice" ? <Notice>{previewText}</Notice> : null}
      {kind === "warning" ? <Warning>{previewText}</Warning> : null}
      {kind === "legalSource" ? (
        <LegalSource title={text(values.title, "Правовое основание")}>{previewText}</LegalSource>
      ) : null}
    </PreviewFrame>
  );
}

export const QuickAnswerBlockPreview: UIFieldClientComponent = ({ path }) => (
  <BlockPreview path={path} kind="quickAnswer" />
);

export const NoticeBlockPreview: UIFieldClientComponent = ({ path }) => (
  <BlockPreview path={path} kind="notice" />
);

export const WarningBlockPreview: UIFieldClientComponent = ({ path }) => (
  <BlockPreview path={path} kind="warning" />
);

export const LegalSourceBlockPreview: UIFieldClientComponent = ({ path }) => (
  <BlockPreview path={path} kind="legalSource" />
);

export const FaqAccordionBlockPreview: UIFieldClientComponent = ({ path }) => {
  const rows = useBlockRows(path, "items");
  const items: PreviewFaqItem[] = rows.map((row, index) => ({
    question: text(row.question, "Вопрос " + (index + 1)),
    answer: text(row.answer, "Ответ появится здесь после заполнения поля."),
  }));

  return (
    <PreviewFrame>
      {items.length > 0
        ? <FaqAccordion items={items} isPreview />
        : <p>Добавьте вопрос, чтобы увидеть блок FAQ.</p>}
    </PreviewFrame>
  );
};

export const RelatedGuideBlockPreview: UIFieldClientComponent = ({ path }) => {
  const values = useBlockValues(path, ["title", "description", "externalHref", "href"]);

  return (
    <PreviewFrame>
      <RelatedGuide
        href={text(values.externalHref, text(values.href, "/"))}
        title={text(values.title, "Заголовок следующего шага")}
        description={text(values.description, "Описание связанной инструкции.")}
      />
    </PreviewFrame>
  );
};

export const LinkCardGridBlockPreview: UIFieldClientComponent = ({ path }) => {
  const rows = useBlockRows(path, "items");
  const items: PreviewLinkCard[] = rows.map((row, index) => ({
    href: text(row.externalHref, text(row.href, "/")),
    title: text(row.title, "Карточка " + (index + 1)),
    description: text(row.description, "Описание появится здесь после заполнения поля."),
    label: text(row.label),
  }));

  return (
    <PreviewFrame>
      {items.length > 0
        ? <LinkCardGrid items={items} />
        : <p>Добавьте карточку, чтобы увидеть сетку ссылок.</p>}
    </PreviewFrame>
  );
};

export const ConsultationBannerBlockPreview: UIFieldClientComponent = ({ path }) => {
  const values = useBlockValues(path, ["title", "description", "context"]);
  const context = text(values.context, "Баннер в статье");

  return (
    <PreviewFrame>
      <ConsultationBannerPreview
        title={text(values.title, "Заголовок консультационного блока")}
        description={text(values.description, "Описание консультационного блока.")}
        isBottom={context.includes("Финальный")}
      />
    </PreviewFrame>
  );
};
