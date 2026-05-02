import { prisma } from "@/lib/prisma";
import { computeScore } from "@/lib/scorer";
import { normalizeCategory } from "@/lib/utils";

const BASE_URL = "https://ads.tiktok.com/business/creativecenter/top-products/pc/en";
const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const MAX_SCRAPE_AGE_HOURS = 20;

export async function canScrape(): Promise<boolean> {
  const last = await prisma.scrapeLog.findFirst({
    where: { scraper: "tiktok-products", status: "success" },
    orderBy: { startedAt: "desc" },
  });
  if (!last) return true;
  const ageHours = (Date.now() - last.startedAt.getTime()) / 3_600_000;
  return ageHours >= MAX_SCRAPE_AGE_HOURS;
}

export async function runTikTokScraper(logId: number): Promise<void> {
  const { chromium } = await import("playwright");

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 900 },
      locale: "en-US",
      timezoneId: "America/New_York",
    });

    const page = await context.newPage();

    // Try to intercept XHR data — more reliable than DOM scraping
    let interceptedProducts: RawProduct[] = [];
    await page.route("**/*", async (route, request) => {
      const response = await route.fetch().catch(() => null);
      if (response) {
        const contentType = response.headers()["content-type"] ?? "";
        if (contentType.includes("application/json")) {
          const text = await response.text().catch(() => "");
          if (text.includes('"cvr"') || text.includes('"conversion_rate"') || text.includes('"cpa"')) {
            const parsed = tryParseProducts(text);
            if (parsed.length > 0) interceptedProducts = parsed;
          }
        }
        await route.fulfill({ response });
      } else {
        await route.continue();
      }
    });

    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });

    // Dismiss cookie banner
    const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("OK")');
    if (await cookieBtn.first().isVisible({ timeout: 4000 }).catch(() => false)) {
      await cookieBtn.first().click();
      await page.waitForTimeout(1000);
    }

    // Wait a bit for XHR interception to capture data
    await page.waitForTimeout(3000);

    let products: RawProduct[] = interceptedProducts;

    // Fallback to DOM scraping if XHR didn't yield results
    if (products.length === 0) {
      products = await domScrape(page);
    }

    const saved = await persistProducts(products);

    await prisma.scrapeLog.update({
      where: { id: logId },
      data: { status: "success", itemsFound: saved, finishedAt: new Date() },
    });
  } catch (err) {
    await prisma.scrapeLog.update({
      where: { id: logId },
      data: {
        status: "error",
        errorMsg: err instanceof Error ? err.message : String(err),
        finishedAt: new Date(),
      },
    });
    throw err;
  } finally {
    await browser?.close();
  }
}

interface RawProduct {
  name: string;
  category: string | null;
  ctr: number | null;
  cvr: number | null;
  cpa: number | null;
  impressions: number | null;
  growthPct: number | null;
}

function tryParseProducts(json: string): RawProduct[] {
  try {
    const data = JSON.parse(json);
    const list = findArray(data);
    if (!list) return [];
    return (list as unknown[])
      .map((rawItem) => {
        const item = rawItem as Record<string, unknown>;
        return {
          name: String(item.product_name ?? item.name ?? item.title ?? ""),
          category: String(item.category ?? item.industry ?? ""),
          ctr: toFloat(item.ctr ?? item.click_through_rate),
          cvr: toFloat(item.cvr ?? item.conversion_rate),
          cpa: toFloat(item.cpa ?? item.cost_per_acquisition),
          impressions: toInt(item.impressions ?? item.impression),
          growthPct: toFloat(item.growth ?? item.growth_rate ?? item.rise_rate),
        };
      })
      .filter((p) => p.name && p.name.length > 1);
  } catch {
    return [];
  }
}

function findArray(obj: unknown, depth = 0): unknown[] | null {
  if (depth > 5) return null;
  if (Array.isArray(obj) && obj.length > 3 && typeof obj[0] === "object") return obj;
  if (obj && typeof obj === "object") {
    for (const val of Object.values(obj as Record<string, unknown>)) {
      const found = findArray(val, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

async function domScrape(page: import("playwright").Page): Promise<RawProduct[]> {
  await page.waitForSelector('[class*="product"], [class*="item"]', { timeout: 15_000 }).catch(() => {});

  return page.evaluate(() => {
    const parseNum = (s: string | null | undefined) => {
      if (!s) return null;
      const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
      return isNaN(n) ? null : n;
    };
    const parseImp = (s: string | null | undefined) => {
      if (!s) return null;
      if (s.includes("M")) return Math.round(parseFloat(s) * 1_000_000);
      if (s.includes("K")) return Math.round(parseFloat(s) * 1_000);
      return parseInt(s.replace(/,/g, ""), 10) || null;
    };
    const getText = (el: Element, sel: string) =>
      el.querySelector(sel)?.textContent?.trim() ?? null;

    const cards = document.querySelectorAll('[class*="product-card"], [class*="item-card"], [class*="productCard"]');
    return Array.from(cards).map((card) => ({
      name: getText(card, '[class*="name"], [class*="title"]') ?? "",
      category: getText(card, '[class*="category"], [class*="tag"]'),
      ctr: parseNum(getText(card, '[class*="ctr"]')),
      cvr: parseNum(getText(card, '[class*="cvr"]')),
      cpa: parseNum(getText(card, '[class*="cpa"]')),
      impressions: parseImp(getText(card, '[class*="impression"]')),
      growthPct: parseNum(getText(card, '[class*="growth"], [class*="rise"]')),
    }));
  });
}

async function persistProducts(products: RawProduct[]): Promise<number> {
  let count = 0;
  for (const p of products) {
    if (!p.name || p.name.length < 2) continue;
    const category = normalizeCategory(p.category);

    const product = await prisma.product.upsert({
      where: { name_category: { name: p.name, category } },
      create: { name: p.name, category },
      update: {},
    });

    const score =
      p.cvr != null && p.cpa != null && p.growthPct != null && p.impressions != null
        ? computeScore({ cvr: p.cvr, cpa: p.cpa, growthPct: p.growthPct, impressions: p.impressions })
        : null;

    await prisma.productSnapshot.create({
      data: {
        productId: product.id,
        ctr: p.ctr,
        cvr: p.cvr,
        cpa: p.cpa,
        impressions: p.impressions,
        growthPct: p.growthPct,
        score,
      },
    });
    count++;
  }
  return count;
}

function toFloat(v: unknown): number | null {
  if (v == null) return null;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}

function toInt(v: unknown): number | null {
  if (v == null) return null;
  const n = parseInt(String(v), 10);
  return isNaN(n) ? null : n;
}
