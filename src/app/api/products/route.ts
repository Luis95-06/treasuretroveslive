import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const days = parseInt(searchParams.get("days") ?? "30");
  const cutoff = new Date(Date.now() - days * 86_400_000);

  const snapshots = await prisma.productSnapshot.findMany({
    where: {
      scrapedAt: { gte: cutoff },
      ...(category && category !== "all" ? { product: { category } } : {}),
    },
    include: { product: true },
    orderBy: { score: "desc" },
    distinct: ["productId"],
    take: 100,
  });

  return Response.json(snapshots);
}
