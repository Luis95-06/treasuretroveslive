import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { salePrice, supplierCost, shippingCost = 0, status, notes } = body;

  const profit = salePrice - supplierCost - shippingCost;
  const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  const order = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { salePrice, supplierCost, shippingCost, profit, profitMargin, status, notes },
  });

  return Response.json(order);
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  await prisma.order.delete({ where: { id: parseInt(id) } });
  return new Response(null, { status: 204 });
}
