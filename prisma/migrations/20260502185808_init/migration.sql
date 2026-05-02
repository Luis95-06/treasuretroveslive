-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProductSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ctr" REAL,
    "cvr" REAL,
    "cpa" REAL,
    "impressions" INTEGER,
    "growthPct" REAL,
    "score" REAL,
    CONSTRAINT "ProductSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "supplierName" TEXT,
    "productTitle" TEXT NOT NULL,
    "supplierPrice" REAL NOT NULL,
    "shippingDays" INTEGER,
    "moq" INTEGER,
    "productUrl" TEXT,
    "imageUrl" TEXT,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Supplier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Script" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "angle" TEXT NOT NULL,
    "hookText" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Script_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "salePrice" REAL NOT NULL,
    "supplierCost" REAL NOT NULL,
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "profit" REAL NOT NULL,
    "profitMargin" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orderedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scraper" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsFound" INTEGER,
    "errorMsg" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_category_key" ON "Product"("name", "category");

-- CreateIndex
CREATE INDEX "ProductSnapshot_productId_scrapedAt_idx" ON "ProductSnapshot"("productId", "scrapedAt");

-- CreateIndex
CREATE INDEX "Supplier_productId_scrapedAt_idx" ON "Supplier"("productId", "scrapedAt");

-- CreateIndex
CREATE INDEX "Order_orderedAt_idx" ON "Order"("orderedAt");
