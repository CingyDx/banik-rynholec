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

test("calendar renders the real Czech month grid and follows today", async ({ page }) => {
  await page.goto("/kalendar");
  await expect(page.locator(".calendar-app[data-ready='true']")).toBeVisible();

  const liveDate = await page.evaluate(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  });
  const currentMonth = new Date(liveDate.year, liveDate.month, 1);
  const expectedFirstDay = mondayAtStartOfWeek(currentMonth);
  const expectedLastDay = addCalendarDays(expectedFirstDay, 41);
  const expectedToday = new Date(liveDate.year, liveDate.month, liveDate.day);
  const expectedMonthLabel = new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" }).format(currentMonth);

  const cells = page.locator(".month-cell");
  await expect(cells).toHaveCount(42);
  await expect(cells.first()).toHaveAttribute("data-date", toDateKey(expectedFirstDay));
  await expect(cells.first().locator("strong")).toHaveText(toDayMonthLabel(expectedFirstDay));
  await expect(cells.last()).toHaveAttribute("data-date", toDateKey(expectedLastDay));
  await expect(cells.last().locator("strong")).toHaveText(toDayMonthLabel(expectedLastDay));

  const dateLabels = await cells.locator("strong").allTextContents();
  expect(dateLabels).toHaveLength(42);
  expect(dateLabels.every((label) => label.trim().length > 0)).toBe(true);

  const today = page.locator('.month-cell[aria-current="date"]');
  await expect(today).toHaveCount(1);
  await expect(today).toHaveAttribute("data-date", toDateKey(expectedToday));
  await expect(today.locator("header span")).toHaveText(new Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(expectedToday));
  await expect(today.locator("header small")).toHaveText("Dnes");
  await expect(today.locator("header strong")).toHaveText(toDayMonthLabel(expectedToday));

  await page.getByRole("button", { name: "Další období" }).click();
  const nextMonth = new Date(liveDate.year, liveDate.month + 1, 1);
  const nextMonthLabel = new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" }).format(nextMonth);
  await expect(page.getByText(nextMonthLabel, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Dnes" }).click();
  await expect(page.getByText(expectedMonthLabel, { exact: true })).toBeVisible();
  await expect(page.locator('.month-cell[aria-current="date"]')).toHaveAttribute("data-date", toDateKey(expectedToday));
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

function mondayAtStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const weekday = result.getDay() || 7;
  result.setDate(result.getDate() - weekday + 1);
  return result;
}

function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function toDayMonthLabel(date: Date): string {
  return `${date.getDate()}. ${date.getMonth() + 1}.`;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}
