import { prisma } from "@/lib/prisma";

const CJ_BASE = "https://cjdropshipping.com/search";
const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

export async function scrapeCJSuppliers(productId: number, query: string): Promise<number> {
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });

    const url = `${CJ_BASE}?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    await page.waitForSelector(
      '.productListItem, [class*="product-item"], .goods-item, [class*="goods"]',
      { timeout: 12_000 }
    ).catch(() => {});

    await page.waitForTimeout(1000 + Math.random() * 1000);

    const results = await page.evaluate(() => {
      const sel = '.productListItem, [class*="product-item"], .goods-item, [class*="productItem"]';
      const cards = document.querySelectorAll(sel);

      return Array.from(cards)
        .slice(0, 10)
        .map((card) => {
          const get = (s: string) => card.querySelector(s)?.textContent?.trim() ?? null;
          const priceText = get('.sellPrice, [class*="price"], .price-value, [class*="sell"]');
          const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, "")) : null;
          const shippingText = get('[class*="shipping"], [class*="delivery"]');
          const shippingMatch = shippingText?.match(/(\d+)/);
          return {
            productTitle: get('.productTitle, [class*="title"], h3, h4') ?? "",
            supplierName: get('[class*="supplier"], [class*="store"]'),
            supplierPrice: price,
            shippingDays: shippingMatch ? parseInt(shippingMatch[1]) : null,
            productUrl: (card.querySelector("a") as HTMLAnchorElement)?.href ?? null,
            imageUrl: (card.querySelector("img") as HTMLImageElement)?.src ?? null,
          };
        })
        .filter((r) => r.productTitle && r.supplierPrice != null && !isNaN(r.supplierPrice!));
    });

    let count = 0;
    for (const r of results) {
      await prisma.supplier.create({
        data: {
          productId,
          source: "cj",
          productTitle: r.productTitle,
          supplierName: r.supplierName,
          supplierPrice: r.supplierPrice!,
          shippingDays: r.shippingDays,
          moq: 1,
          productUrl: r.productUrl,
          imageUrl: r.imageUrl,
        },
      });
      count++;
    }

    return count;
  } finally {
    await browser.close();
  }
}
