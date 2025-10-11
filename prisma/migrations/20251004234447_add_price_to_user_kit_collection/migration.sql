-- AlterTable
ALTER TABLE "public"."user_kit_collections" ADD COLUMN     "price" INTEGER DEFAULT 0;

-- CreateIndex
CREATE INDEX "user_kit_collections_price_idx" ON "public"."user_kit_collections"("price");
