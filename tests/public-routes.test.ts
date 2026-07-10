import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES } from "@/lib/public-routes";

describe("public route catalog", () => {
  it("contains unique normalized paths", () => {
    const paths = PUBLIC_ROUTES.map(([path]) => path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.every((path) => path === "" || (path.startsWith("/") && !path.endsWith("/")))).toBe(true);
  });

  it("publishes privacy settings", () => {
    expect(PUBLIC_ROUTES.some(([path]) => path === "/privacy")).toBe(true);
  });
});
