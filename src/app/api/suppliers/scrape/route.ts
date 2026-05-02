import { prisma } from "@/lib/prisma";
import { scrapeCJSuppliers } from "@/scrapers/cj-supplier";

export async function POST(req: Request) {
  const { productId, query } = await req.json();
  if (!productId || !query) {
    return Response.json({ error: "productId and query required" }, { status: 400 });
  }

  const log = await prisma.scrapeLog.create({
    data: { scraper: "cj-supplier", status: "running" },
  });

  scrapeCJSuppliers(productId, query)
    .then(async (count) => {
      await prisma.scrapeLog.update({
        where: { id: log.id },
        data: { status: "success", itemsFound: count, finishedAt: new Date() },
      });
    })
    .catch(async (err) => {
      await prisma.scrapeLog.update({
        where: { id: log.id },
        data: { status: "error", errorMsg: String(err), finishedAt: new Date() },
      });
    });

  return Response.json({ jobId: log.id, message: "Supplier search started" });
}
