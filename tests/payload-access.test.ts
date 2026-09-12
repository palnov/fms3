import { describe, expect, it } from "vitest";
import { canCreateContent, canDeleteContent, canUpdateContent } from "@/payload/access";

function accessArgs(role: string, data?: Record<string, unknown>) {
  return { req: { user: { role } }, data } as never;
}

describe("Payload content access", () => {
  it("lets editors change drafts but never publish or bulk-update content", async () => {
    expect(await canUpdateContent(accessArgs("editor", { title: "Черновик" }))).toBe(true);
    expect(await canUpdateContent(accessArgs("editor", { _status: "published" }))).toBe(false);
    expect(await canUpdateContent(accessArgs("editor"))).toBe(false);
  });

  it("limits publishers to status changes", async () => {
    expect(await canUpdateContent(accessArgs("publisher", { _status: "published" }))).toBe(true);
    expect(await canUpdateContent(accessArgs("publisher", { title: "Изменение" }))).toBe(false);
    expect(await canUpdateContent(accessArgs("publisher"))).toBe(false);
  });

  it("prevents editors from publishing a document during creation", () => {
    expect(canCreateContent(accessArgs("editor", { _status: "draft", title: "Черновик" }))).toBe(true);
    expect(canCreateContent(accessArgs("editor", { title: "Без статуса" }))).toBe(false);
    expect(canCreateContent(accessArgs("editor", { _status: "published" }))).toBe(false);
    expect(canCreateContent(accessArgs("publisher", { _status: "draft" }))).toBe(false);
  });

  it("allows a publisher to submit an unchanged form while publishing", async () => {
    const args = {
      req: {
        user: { role: "publisher" },
        routeParams: { collection: "pages" },
        payload: { findByID: async () => ({ title: "Исходный" }) },
      },
      id: "page-1",
      data: { _status: "published", title: "Исходный" },
    };
    expect(await canUpdateContent(args as never)).toBe(true);
    expect(await canUpdateContent({ ...args, data: { _status: "published", title: "Подмена" } } as never)).toBe(false);
  });

  it("keeps destructive content operations with administrators", () => {
    expect(canDeleteContent(accessArgs("admin"))).toBe(true);
    expect(canDeleteContent(accessArgs("editor"))).toBe(false);
    expect(canDeleteContent(accessArgs("publisher"))).toBe(false);
  });
});
