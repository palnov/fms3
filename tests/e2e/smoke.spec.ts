import { expect, test } from "@playwright/test";

test("renders the main public experience", async ({ page }) => {
  const consultantRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/consultant")) consultantRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("законный путь");
  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeAttached();
  expect(consultantRequests).toEqual([]);
});

test("renders an MDX article", async ({ page }) => {
  await page.goto("/pathways/vnzh");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Вид на жительство");
});

test("returns a genuine 404", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-real-route");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
});

test("keeps tool controls readable under a dark OS preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/tools/check-rvp");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(31, 44, 65)");
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
