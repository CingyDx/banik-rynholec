import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/klub",
  "/tymy",
  "/novinky",
  "/galerie",
  "/kalendar",
  "/areal",
  "/kontakt",
];

test("homepage presents the club, venue, and upcoming program", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/TJ Baník Rynholec/);
  await expect(page.getByRole("heading", { level: 1, name: "TJ Baník Rynholec" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nejbližší program" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Naše týmy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sportovní areál", exact: true })).toBeVisible();

  const heroImage = page.getByRole("img", { name: "Fotbalové hřiště v Rynholci" });
  await expect(heroImage).toBeVisible();
  await expect(heroImage).toHaveJSProperty("complete", true);
  expect(await heroImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test("every primary public route resolves", async ({ request }) => {
  for (const route of routes) {
    const response = await request.get(route);
    expect(response.ok(), `${route} returned ${response.status()}`).toBe(true);
  }
});

test("gallery and creator credit are visible", async ({ page }) => {
  await page.goto("/galerie");

  await expect(page.getByRole("heading", { name: "Galerie" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Sportovní areál/i }).first()).toBeVisible();

  const creator = page.getByRole("link", { name: /Cingy\.Tech/ });
  await expect(creator).toHaveAttribute("href", "https://cingy.tech");
});

test("calendar supports public read-only views and event details", async ({ page }) => {
  await page.goto("/kalendar");

  await expect(page.getByRole("heading", { level: 1, name: "Kalendář" })).toBeVisible();
  await expect(page.getByLabel("Správa kalendáře")).toBeVisible();
  await expect(page.locator(".calendar-app[data-ready='true']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nový zápis" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Import Excel" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Export Excel" })).toBeHidden();

  await page.getByRole("button", { name: "Týden" }).click();
  await expect(page.getByLabel("Týdenní zobrazení")).toBeVisible();

  await page.getByRole("button", { name: "Seznam" }).click();
  await expect(page.getByLabel("Seznamové zobrazení")).toBeVisible();

  await page.getByRole("button", { name: /A tým vs\. Lorem FC/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Detail události" })).toBeVisible();
  await page.getByRole("button", { name: "Zavřít detail" }).click();
});

test("navigation and layout work at the current viewport", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  if (testInfo.project.name === "mobile-chromium") {
    await page.getByRole("button", { name: "Otevřít navigaci" }).click();
    await expect(page.getByRole("navigation", { name: "Mobilní navigace" })).toBeVisible();
  } else {
    await expect(page.getByRole("navigation", { name: "Hlavní navigace" })).toBeVisible();
  }

  const noHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(noHorizontalOverflow).toBe(true);
});
