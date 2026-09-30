"use client";

import { useFormFields } from "@payloadcms/ui";
import type { UIFieldClientComponent } from "payload";
import {
  LegalSource,
  Notice,
  QuickAnswer,
  Warning,
} from "@/components/mdx/ContentBlocks";
import { renderBlockText } from "@/lib/cms/render-block-text";
import styles from "./ContentBlockPreview.module.css";

type FormFieldState = { value?: unknown };
type PreviewKind = "quickAnswer" | "notice" | "warning" | "legalSource";

function useBlockValues(path: string, keys: string[]) {
  const blockPath = path.slice(0, path.lastIndexOf("."));
  return useFormFields(([formFields]) => {
    const fields = formFields as unknown as Record<string, FormFieldState | undefined>;
    return Object.fromEntries(keys.map((key) => [key, fields[`${blockPath}.${key}`]?.value]));
  });
}

function BlockPreview({ path, kind }: { path: string; kind: PreviewKind }) {
  const keys = kind === "legalSource" ? ["content", "title"] : ["content"];
  const values = useBlockValues(path, keys);
  const content = typeof values.content === "string" ? values.content : "";
  const previewText = content.trim()
    ? renderBlockText(content)
    : <p>Текст предпросмотра появится здесь после заполнения поля.</p>;

  return (
    <section className={styles.field} aria-label="Предпросмотр блока на странице">
      <p className={styles.label}>Как блок выглядит на странице</p>
      <div className={`${styles.canvas} cms-block-preview`}>
        {kind === "quickAnswer" ? <QuickAnswer>{previewText}</QuickAnswer> : null}
        {kind === "notice" ? <Notice>{previewText}</Notice> : null}
        {kind === "warning" ? <Warning>{previewText}</Warning> : null}
        {kind === "legalSource" ? (
          <LegalSource title={typeof values.title === "string" && values.title.trim() ? values.title : undefined}>
            {previewText}
          </LegalSource>
        ) : null}
      </div>
    </section>
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
