import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../docs/screenshots/homepage");
mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.HOMEPAGE_URL ?? "http://localhost:3000/";
const widths = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const highlight = {
  390: "mobile",
  768: "tablet",
  1280: "desktop",
};

const browser = await chromium.launch({ headless: true });
const report = [];

for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });

  const overflow = Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) > metrics.clientWidth + 1;
  const label = highlight[width] ?? `w${width}`;
  const file = join(outDir, `homepage-${width}px-${label}.png`);
  await page.screenshot({ path: file, fullPage: true });

  report.push({
    width,
    file: `docs/screenshots/homepage/homepage-${width}px-${label}.png`,
    overflow,
    scrollWidth: metrics.scrollWidth,
    clientWidth: metrics.clientWidth,
  });
  await page.close();
}

await browser.close();
writeFileSync(join(outDir, "viewport-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
