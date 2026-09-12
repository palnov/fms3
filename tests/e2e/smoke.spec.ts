import { expect, test } from "@playwright/test";

test("renders the main public experience", async ({ page }) => {
  const consultantRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/consultant")) consultantRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Как жить и работать в России законно");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const documents = page.getByRole("img", { name: "Паспорт России, РВП и вид на жительство" });
  await expect(documents).toBeVisible();
  await expect(documents.locator('text').filter({ hasText: "ВИД НА ЖИТЕЛЬСТВО" })).toBeAttached();
  await expect(documents.locator('text').filter({ hasText: "ИНОСТРАННОГО ГРАЖДАНИНА" })).toBeAttached();
  await expect(documents.locator('text').filter({ hasText: "РАЗРЕШЕНО" })).toBeAttached();
  await expect(documents.locator('path[d="M24 78h152M24 222h152"]')).toHaveCount(0);
  await expect(page.getByText("МС", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Независимый миграционный справочник", { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-motion="hero-copy"] a[href="/editorial-policy"]')).toHaveCount(0);
  await expect(page.locator("#faq a[href=\"/editorial-policy\"]")).toHaveCount(0);
  await expect(page.locator('footer a[href="/editorial-policy"]')).toHaveCount(1);
  await expect(page.getByText("Подходящий вариант найден")).toHaveCount(0);
  await expect(page.getByText("05 шагов до подачи")).toHaveCount(0);
  await expect(page.getByText("Главный кластер")).toHaveCount(0);
  await expect(page.locator('a[href="/pathways/vnzh"]')).not.toHaveCount(0);
  await expect(page.locator('a[href="/pathways/rvp"]')).not.toHaveCount(0);
  await expect(page.locator('a[href="/pathways/citizenship"]')).not.toHaveCount(0);
  await expect(page.locator('a[href="/pathways/work/patent"]')).not.toHaveCount(0);
  for (const id of ["situations", "tools", "statuses", "guides", "updates", "faq"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeAttached();
  expect(consultantRequests).toEqual([]);
});

test("renders an MDX article", async ({ page }) => {
  await page.goto("/pathways/vnzh");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Вид на жительство");
  await expect(page.getByText(/CMS_BLOCK_\d+/i)).toHaveCount(0);
  await expect(page.locator(".article-next-step-banner").first()).toBeVisible();
});

test("does not scroll an article to restored consultant messages", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("fms3_shared_ai_chat", JSON.stringify({
      version: 1,
      messages: [{
        id: "restored-message",
        sender: "user",
        text: "Сохранённый вопрос",
        timestamp: new Date().toISOString(),
      }],
      language: "ru",
      remainingRequests: 9,
    }));
  });

  await page.goto("/pathways/vnzh");
  await expect(page.getByText("Сохранённый вопрос")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100);
});

test("renders the not-found UI and marks an unknown route noindex", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-real-route");
  // App Router streams the not-found boundary, so Next.js keeps the HTTP
  // status at 200 and communicates the 404 through the rendered boundary.
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content="noindex"]').first()).toBeAttached();
});

test("keeps tool controls readable under a dark OS preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/tools/check-rvp");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(28, 41, 37)");
  await expect(page.getByLabel("Регион подачи документов")).toBeVisible();
  await expect(page.getByLabel("Дата рождения")).toBeVisible();
  await expect(page.getByLabel("Номер документа (паспорта)")).toBeVisible();
});

test("exposes analytics controls on the privacy page", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("button", { name: "Отключить аналитику" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Разрешить аналитику" })).toBeVisible();
  await page.getByRole("button", { name: "Отключить аналитику" }).click();
  await expect.poll(() => page.evaluate(() => ({
    preference: localStorage.getItem("fms3_analytics_preference"),
    disabled: window.disableYaCounter47198382,
  }))).toEqual({ preference: "declined", disabled: true });
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.disableYaCounter47198382)).toBe(true);
});
