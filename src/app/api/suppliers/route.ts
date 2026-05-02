import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const productId = parseInt(req.nextUrl.searchParams.get("productId") ?? "0");
  if (!productId) {
    return Response.json({ error: "productId required" }, { status: 400 });
  }

  const suppliers = await prisma.supplier.findMany({
    where: { productId },
    orderBy: { supplierPrice: "asc" },
  });

  return Response.json(suppliers);
}
