import { prisma } from "@/lib/prisma";
import { isBuyNow } from "@/lib/scorer";

export async function GET() {
  const cutoff = new Date(Date.now() - 30 * 86_400_000);

  const snapshots = await prisma.productSnapshot.findMany({
    where: { scrapedAt: { gte: cutoff }, score: { not: null } },
    include: { product: true },
    orderBy: { score: "desc" },
    distinct: ["productId"],
    take: 50,
  });

  const results = snapshots.map((s) => ({
    ...s,
    isBuyNow:
      s.cvr != null && s.cpa != null && s.score != null
        ? isBuyNow({ cvr: s.cvr, cpa: s.cpa, growthPct: s.growthPct ?? 0, impressions: s.impressions ?? 0, score: s.score })
        : false,
  }));

  return Response.json(results);
}
