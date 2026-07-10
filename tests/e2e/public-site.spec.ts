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

test("seo metadata points crawlers at the public homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://banikrynholec.cz/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Oficiální web TJ Baník Rynholec/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "TJ Baník Rynholec | Fotbalový klub a sportovní areál",
  );
  await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][href="/icon-192.png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/site.webmanifest");

  await page.goto("/kalendar");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://banikrynholec.cz/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");

  await page.goto("/admin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
});

test("gallery and creator credit are visible", async ({ page }) => {
  await page.goto("/galerie");

  await expect(page.getByRole("heading", { name: "Galerie" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Fotbalové hřiště/i }).first()).toBeVisible();

  const creator = page.getByRole("link", { name: /Cingy\.Tech/ });
  await expect(creator).toHaveAttribute("href", "https://cingy.tech");
});

test("calendar supports public read-only empty views", async ({ page }) => {
  await page.goto("/kalendar");

  await expect(page.getByRole("heading", { level: 1, name: "Kalendář" })).toBeVisible();
  await expect(page.getByLabel("Správa kalendáře")).toBeVisible();
  await expect(page.locator(".calendar-app[data-ready='true']")).toBeVisible();
  await expect(page.locator(".filter-count")).toContainText("0");
  await expect(page.getByRole("heading", { name: "Nový zápis" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Import Excel" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Export Excel" })).toBeHidden();
  await expect(page.getByRole("link", { name: "Administrace" })).toHaveAttribute("href", "/admin");

  await page.getByRole("button", { name: "Týden" }).click();
  await expect(page.getByLabel("Týdenní zobrazení")).toBeVisible();

  await page.getByRole("button", { name: "Seznam" }).click();
  await expect(page.getByLabel("Seznamové zobrazení")).toBeVisible();
  await expect(page.getByText("Žádný zápis neodpovídá aktuálním filtrům.")).toBeVisible();
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
