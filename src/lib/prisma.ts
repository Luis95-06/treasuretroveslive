import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

function getDbUrl() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "file:/tmp/dev.db";
  }
  return `file:${path.resolve(process.cwd(), "dev.db")}`;
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: getDbUrl() });
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
