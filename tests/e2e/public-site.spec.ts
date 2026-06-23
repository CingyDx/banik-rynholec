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

test("reservation page is visibly read-only and creator credit is linked", async ({ page }) => {
  await page.goto("/rezervace");

  await expect(page.getByRole("heading", { name: "Rezervace areálu" })).toBeVisible();
  await expect(page.getByText("Zatím pouze náhled")).toBeVisible();
  await expect(page.getByRole("button", { name: /Odesílání zatím vypnuto/ })).toBeDisabled();
  await expect(page.getByLabel("Prostor")).toBeDisabled();

  const creator = page.getByRole("link", { name: /Cingy\.Tech/ });
  await expect(creator).toHaveAttribute("href", "https://cingy.tech");
});

test("calendar supports views, editable mock reservations, and Excel export", async ({ page }) => {
  await page.goto("/kalendar");

  await expect(page.getByRole("heading", { level: 1, name: "Kalendář" })).toBeVisible();
  await expect(page.getByLabel("Správa kalendáře")).toBeVisible();
  await expect(page.locator(".calendar-app[data-ready='true']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nová rezervace" })).toBeVisible();

  await page.getByRole("button", { name: "Týden" }).click();
  await expect(page.getByLabel("Týdenní zobrazení")).toBeVisible();

  await page.getByRole("button", { name: "Seznam" }).click();
  await expect(page.getByLabel("Seznamové zobrazení")).toBeVisible();

  await page.getByRole("button", { name: /A tým vs\. Lorem FC/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Detail události" })).toBeVisible();
  await page.getByRole("button", { name: "Zavřít detail" }).click();

  const composer = page.locator(".booking-composer");
  await composer.getByLabel("Název").fill("Test rezervace");
  await composer.getByLabel("Prostor / tým").selectOption("sauna");
  await composer.getByLabel("Stav").selectOption("čeká na schválení");
  await composer.getByLabel("Začátek").fill("2026-06-29T18:00");
  await composer.getByLabel("Konec").fill("2026-06-29T20:00");
  await page.getByRole("button", { name: "Přidat rezervaci" }).click();

  const detail = page.getByRole("dialog", { name: "Detail události" });
  await expect(detail).toBeVisible();
  await expect(detail.getByLabel("Název")).toHaveValue("Test rezervace");
  await page.getByRole("button", { name: "Zavřít detail" }).click();

  await page.getByRole("button", { name: "Seznam" }).click();
  await expect(page.getByRole("button", { name: /Test rezervace/ })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Excel" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("banik-rynholec-kalendar.xlsx");
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
