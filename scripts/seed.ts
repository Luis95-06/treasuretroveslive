import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { computeScore } from "../src/lib/scorer";

const DB_URL = `file:${path.resolve(__dirname, "../dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: DB_URL });
const prisma = new PrismaClient({ adapter } as any);

const SEED_PRODUCTS = [
  { name: "Phone Cases", category: "accessories", ctr: 4.73, cvr: 56.29, cpa: 0.22, impressions: 40_000_000, growthPct: 25 },
  { name: "Household Cleaners", category: "household", ctr: 1.63, cvr: 100, cpa: 0.26, impressions: 41_000_000, growthPct: 4 },
  { name: "Serums and Essences", category: "beauty", ctr: 1.83, cvr: 3.85, cpa: 5.09, impressions: 156_000_000, growthPct: 11 },
  { name: "Perfume", category: "beauty", ctr: 2.39, cvr: 5.74, cpa: 4.38, impressions: 125_000_000, growthPct: 5 },
  { name: "Mens T-Shirts", category: "apparel", ctr: 3.9, cvr: 5.89, cpa: 1.76, impressions: 25_000_000, growthPct: 11 },
  { name: "Mens Trousers", category: "apparel", ctr: 4.45, cvr: 7.39, cpa: 1.62, impressions: 23_000_000, growthPct: 13 },
  { name: "Lipstick and Lip Gloss", category: "beauty", ctr: 4.41, cvr: 6.72, cpa: 2.44, impressions: 40_000_000, growthPct: 3 },
  { name: "Shampoo and Conditioner", category: "beauty", ctr: 3.32, cvr: 5.07, cpa: 3.85, impressions: 57_000_000, growthPct: 7 },
  { name: "Beauty Supplements", category: "health", ctr: 2.35, cvr: 7.51, cpa: 6.42, impressions: 25_000_000, growthPct: 7 },
  { name: "Womens T-Shirts", category: "apparel", ctr: 5.22, cvr: 5.94, cpa: 1.73, impressions: 8_000_000, growthPct: 10 },
  { name: "Mens Shorts", category: "apparel", ctr: 3.01, cvr: 8.68, cpa: 1.66, impressions: 18_000_000, growthPct: 8 },
  { name: "Moisturisers", category: "beauty", ctr: 2.0, cvr: 6.12, cpa: 4.0, impressions: 55_000_000, growthPct: 9 },
  { name: "Facial Sunscreen", category: "beauty", ctr: 2.71, cvr: 6.42, cpa: 3.52, impressions: 25_000_000, growthPct: 9 },
  { name: "Concealer and Foundation", category: "beauty", ctr: 5.18, cvr: 4.63, cpa: 3.19, impressions: 28_000_000, growthPct: 4 },
  { name: "Body Wash and Soap", category: "beauty", ctr: 2.31, cvr: 6.57, cpa: 3.09, impressions: 32_000_000, growthPct: -10 },
];

async function main() {
  console.log("Seeding database...");
  for (const p of SEED_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { name_category: { name: p.name, category: p.category } },
      create: { name: p.name, category: p.category },
      update: {},
    });
    const score = computeScore({ cvr: p.cvr, cpa: p.cpa, growthPct: p.growthPct, impressions: p.impressions });
    await prisma.productSnapshot.create({
      data: { productId: product.id, ctr: p.ctr, cvr: p.cvr, cpa: p.cpa, impressions: p.impressions, growthPct: p.growthPct, score },
    });
    console.log(`  ✓ ${p.name} (score: ${score})`);
  }
  console.log("\nDone! Database seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
