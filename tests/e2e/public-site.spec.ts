import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/klub",
  "/tymy",
  "/novinky",
  "/kalendar",
  "/areal",
  "/kontakt",
  "/rezervace",
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

test("navigation and layout work at the current viewport", async ({ page }, testInfo) => {
  await page.goto("/");

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
