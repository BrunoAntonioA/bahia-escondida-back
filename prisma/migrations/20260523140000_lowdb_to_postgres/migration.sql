-- Sale: replace saleType/saleIdentifier with app fields from lowdb
ALTER TABLE "Sale" DROP COLUMN IF EXISTS "saleType";
ALTER TABLE "Sale" DROP COLUMN IF EXISTS "saleIdentifier";

ALTER TABLE "Sale" ADD COLUMN IF NOT EXISTS "isDelivery" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sale" ADD COLUMN IF NOT EXISTS "tableNumber" INTEGER;
ALTER TABLE "Sale" ADD COLUMN IF NOT EXISTS "customerNickname" TEXT;
ALTER TABLE "Sale" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3);

ALTER TABLE "Sale" ALTER COLUMN "status" SET DEFAULT 'abierta';

DROP INDEX IF EXISTS "Sale_saleType_idx";

-- SaleProduct: line-item quantity
ALTER TABLE "SaleProduct" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS "SaleProduct_saleId_productId_key" ON "SaleProduct"("saleId", "productId");

-- Payments
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "cashPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cardPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "transferPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tipPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Payment_saleId_idx" ON "Payment"("saleId");

ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_saleId_fkey";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
