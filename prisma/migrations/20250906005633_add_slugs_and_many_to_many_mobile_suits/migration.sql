/*
  Warnings:

  - You are about to drop the column `mobileSuitId` on the `kits` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `kits` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `mobile_suits` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `product_lines` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `series` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `timelines` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."kits" DROP CONSTRAINT "kits_mobileSuitId_fkey";

-- AlterTable
ALTER TABLE "public"."grades" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."kits" DROP COLUMN "mobileSuitId",
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."mobile_suits" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."product_lines" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."series" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."timelines" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "public"."kit_mobile_suits" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "mobileSuitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_mobile_suits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kit_mobile_suits_kitId_mobileSuitId_key" ON "public"."kit_mobile_suits"("kitId", "mobileSuitId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_slug_key" ON "public"."grades"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "kits_slug_key" ON "public"."kits"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_suits_slug_key" ON "public"."mobile_suits"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_lines_slug_key" ON "public"."product_lines"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "public"."series"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "timelines_slug_key" ON "public"."timelines"("slug");

-- AddForeignKey
ALTER TABLE "public"."kit_mobile_suits" ADD CONSTRAINT "kit_mobile_suits_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kit_mobile_suits" ADD CONSTRAINT "kit_mobile_suits_mobileSuitId_fkey" FOREIGN KEY ("mobileSuitId") REFERENCES "public"."mobile_suits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
