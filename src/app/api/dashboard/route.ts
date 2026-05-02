import { prisma } from "@/lib/prisma";
import { isBuyNow } from "@/lib/scorer";
import { format, subDays } from "date-fns";

export async function GET() {
  const now = new Date();
  const cutoff30 = subDays(now, 30);

  const [topSnapshots, recentOrders, allOrders] = await Promise.all([
    prisma.productSnapshot.findMany({
      where: { scrapedAt: { gte: subDays(now, 7) }, score: { not: null } },
      include: { product: true },
      orderBy: { score: "desc" },
      distinct: ["productId"],
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { orderedAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { orderedAt: { gte: cutoff30 } },
      orderBy: { orderedAt: "asc" },
    }),
  ]);

  const topProducts = topSnapshots.map((s) => ({
    ...s,
    isBuyNow:
      s.cvr != null && s.cpa != null && s.score != null
        ? isBuyNow({ cvr: s.cvr, cpa: s.cpa, growthPct: s.growthPct ?? 0, impressions: s.impressions ?? 0, score: s.score })
        : false,
  }));

  // Aggregate orders by day
  const profitByDay: Record<string, { date: string; revenue: number; profit: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(now, i), "MMM dd");
    profitByDay[d] = { date: d, revenue: 0, profit: 0 };
  }
  for (const o of allOrders) {
    const d = format(o.orderedAt, "MMM dd");
    if (profitByDay[d]) {
      profitByDay[d].revenue += o.salePrice;
      profitByDay[d].profit += o.profit;
    }
  }

  const totalRevenue = allOrders.reduce((s, o) => s + o.salePrice, 0);
  const totalProfit = allOrders.reduce((s, o) => s + o.profit, 0);
  const avgMargin = allOrders.length > 0
    ? allOrders.reduce((s, o) => s + o.profitMargin, 0) / allOrders.length
    : 0;

  return Response.json({
    topProducts,
    recentOrders,
    profitByDay: Object.values(profitByDay),
    totalStats: {
      revenue: totalRevenue,
      profit: totalProfit,
      orders: allOrders.length,
      avgMargin,
      bestProduct: topSnapshots[0]?.product.name ?? "—",
    },
  });
}
