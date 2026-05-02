import { prisma } from "@/lib/prisma";
import { generateScript, type ScriptAngle, type ProductCategory } from "@/lib/script-templates";

export async function POST(req: Request) {
  const { productId, productName, angle, category, benefit, problem } = await req.json();

  if (!productName || !angle || !category || !benefit) {
    return Response.json({ error: "productName, angle, category, benefit required" }, { status: 400 });
  }

  const result = generateScript({
    productName,
    angle: angle as ScriptAngle,
    category: category as ProductCategory,
    benefit,
    problem,
  });

  if (productId) {
    await prisma.script.create({
      data: {
        productId: parseInt(productId),
        angle,
        hookText: result.hookVariants[0],
        bodyText: result.bodyVariants[0],
        ctaText: result.ctaVariants[0],
        hashtags: JSON.stringify(result.hashtags),
      },
    });
  }

  return Response.json(result);
}

export async function GET() {
  const scripts = await prisma.script.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json(scripts);
}
