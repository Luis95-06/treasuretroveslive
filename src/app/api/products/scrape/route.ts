import { prisma } from "@/lib/prisma";
import { canScrape, runTikTokScraper } from "@/scrapers/tiktok-products";

export async function POST() {
  const ok = await canScrape();
  if (!ok) {
    return Response.json({ error: "Scraped recently — wait 20 hours between scrapes." }, { status: 429 });
  }

  const log = await prisma.scrapeLog.create({
    data: { scraper: "tiktok-products", status: "running" },
  });

  runTikTokScraper(log.id).catch(console.error);

  return Response.json({ jobId: log.id, message: "Scrape started" });
}

export async function GET() {
  const logs = await prisma.scrapeLog.findMany({
    where: { scraper: "tiktok-products" },
    orderBy: { startedAt: "desc" },
    take: 5,
  });
  return Response.json(logs);
}
