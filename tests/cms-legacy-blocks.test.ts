import { describe, expect, it } from "vitest";
import {
  containsLegacyBlockTokens,
  parseLegacyBlocks,
  replaceLegacyBlockTokens,
} from "@/lib/cms/legacy-blocks";

const source = `# ВНЖ

<ArticleMeta reviewed="10 июля 2026 года" readingTime="14 минут чтения" />

<QuickAnswer>
Короткий ответ по статье.
</QuickAnswer>

<ConsultationBanner title="Свяжитесь со специалистом" description="Опишите ситуацию" context="Статья о ВНЖ" />

<FaqAccordion items={[{ question: "Вопрос?", answer: "Ответ." }]} />
`;

describe("legacy CMS block compatibility", () => {
  it("parses migrated block data from the original MDX", () => {
    const blocks = parseLegacyBlocks(source);

    expect(blocks).toHaveLength(4);
    expect(blocks[0]).toMatchObject({
      token: "CMS_BLOCK_0",
      blockType: "articleMeta",
      fields: { reviewed: "10 июля 2026 года", readingTime: "14 минут чтения" },
    });
    expect(blocks[1]).toMatchObject({ blockType: "quickAnswer", fields: { content: "Короткий ответ по статье." } });
    expect(blocks[2]).toMatchObject({ blockType: "consultationBanner", fields: { title: "Свяжитесь со специалистом" } });
    expect(blocks[3]).toMatchObject({
      blockType: "faqAccordion",
      fields: { items: [{ question: "Вопрос?", answer: "Ответ." }] },
    });
  });

  it("restores tokens inside the Lexical root node", () => {
    const blocks = parseLegacyBlocks(source);
    const content = {
      root: {
        children: [
          { type: "paragraph", children: [{ type: "text", text: "CMS_BLOCK_0" }] },
          { type: "paragraph", children: [{ type: "text", text: "CMS_BLOCK_2" }] },
        ],
      },
    };

    expect(containsLegacyBlockTokens(content)).toBe(true);
    const restored = replaceLegacyBlockTokens(content, blocks) as typeof content;
    expect(restored.root.children[0]).toMatchObject({ type: "block", fields: { blockType: "articleMeta" } });
    expect(restored.root.children[1]).toMatchObject({ type: "block", fields: { blockType: "consultationBanner" } });
    expect(containsLegacyBlockTokens(restored)).toBe(false);
  });
});
