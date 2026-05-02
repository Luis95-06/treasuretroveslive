import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30");
  const status = req.nextUrl.searchParams.get("status");
  const cutoff = new Date(Date.now() - days * 86_400_000);

  const orders = await prisma.order.findMany({
    where: {
      orderedAt: { gte: cutoff },
      ...(status && status !== "all" ? { status } : {}),
    },
    orderBy: { orderedAt: "desc" },
  });

  return Response.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { productName, category, salePrice, supplierCost, shippingCost = 0, status = "pending", notes } = body;

  if (!productName || !category || salePrice == null || supplierCost == null) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const profit = salePrice - supplierCost - shippingCost;
  const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  const order = await prisma.order.create({
    data: {
      productName,
      category,
      salePrice: parseFloat(salePrice),
      supplierCost: parseFloat(supplierCost),
      shippingCost: parseFloat(shippingCost),
      profit,
      profitMargin,
      status,
      notes,
    },
  });

  return Response.json(order, { status: 201 });
}
