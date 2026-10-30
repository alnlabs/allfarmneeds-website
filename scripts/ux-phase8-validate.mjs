import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "docs/screenshots/phase8");
mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const routes = [
  { path: "/", name: "home" },
  { path: "/explore", name: "explore" },
  { path: "/services", name: "services" },
  { path: "/jobs", name: "jobs" },
  { path: "/crops", name: "crops" },
  { path: "/buyers", name: "buyers" },
  { path: "/login", name: "login" },
  { path: "/agri-mitra", name: "agri-mitra" },
];

const highlight = {
  390: "mobile",
  768: "tablet",
  1280: "desktop",
};

const browser = await chromium.launch({ headless: true });
const overflowReport = [];
const routeSmoke = [];
const screenshotIndex = [];

async function checkOverflow(page, width, routeName, locale) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  const overflow =
    Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) >
    metrics.clientWidth + 1;
  overflowReport.push({
    width,
    route: routeName,
    locale,
    overflow,
    ...metrics,
  });
  return overflow;
}

async function gotoWithLocale(page, path, locale) {
  await page.context().addCookies([
    {
      name: "afn_locale",
      value: locale,
      url: baseUrl,
    },
    {
      name: "afn_locale_manual",
      value: "1",
      url: baseUrl,
    },
  ]);
  const response = await page.goto(`${baseUrl}${path}`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(500);
  return response?.status() ?? 0;
}

// Homepage overflow matrix (EN)
for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
  });
  const status = await gotoWithLocale(page, "/", "en");
  const overflow = await checkOverflow(page, width, "home", "en");
  const label = highlight[width] ?? `w${width}`;
  const file = `home-en-${width}px-${label}.png`;
  await page.screenshot({ path: join(outDir, file), fullPage: true });
  screenshotIndex.push({ file, width, route: "home", locale: "en", status, overflow });
  await page.close();
}

// Key routes at mobile/tablet/desktop EN + TE (home, explore, login)
for (const locale of ["en", "te"]) {
  for (const width of [390, 768, 1280]) {
    for (const route of [
      { path: "/", name: "home" },
      { path: "/explore", name: "explore" },
      { path: "/login", name: "login" },
      { path: "/services", name: "services" },
    ]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
      });
      const status = await gotoWithLocale(page, route.path, locale);
      const overflow = await checkOverflow(page, width, route.name, locale);
      const label = highlight[width] ?? `w${width}`;
      const file = `${route.name}-${locale}-${width}px-${label}.png`;
      // Avoid duplicating home-en already captured above for 390/768/1280
      if (!(route.name === "home" && locale === "en")) {
        await page.screenshot({ path: join(outDir, file), fullPage: true });
        screenshotIndex.push({
          file,
          width,
          route: route.name,
          locale,
          status,
          overflow,
        });
      }
      await page.close();
    }
  }
}

// Smoke: public routes return usable status (guest)
for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  let status = 0;
  let redirectedToLogin = false;
  try {
    const response = await page.goto(`${baseUrl}${route.path}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    status = response?.status() ?? 0;
    redirectedToLogin = page.url().includes("/login");
  } catch (error) {
    status = 0;
    routeSmoke.push({
      route: route.name,
      path: route.path,
      status,
      ok: false,
      error: String(error),
    });
    await page.close();
    continue;
  }
  // agri-mitra requires auth → redirect to login is OK for guests
  const ok =
    route.name === "agri-mitra"
      ? redirectedToLogin || status === 200
      : status === 200;
  routeSmoke.push({
    route: route.name,
    path: route.path,
    status,
    redirectedToLogin,
    ok,
  });
  await page.close();
}

await browser.close();

const summary = {
  capturedAt: new Date().toISOString(),
  baseUrl,
  overflowFailCount: overflowReport.filter((r) => r.overflow).length,
  smokeFailCount: routeSmoke.filter((r) => !r.ok).length,
  overflowReport,
  routeSmoke,
  screenshotIndex,
};

writeFileSync(join(outDir, "phase8-report.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
