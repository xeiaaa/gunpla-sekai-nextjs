/*
  Warnings:

  - A unique constraint covering the columns `[buildId]` on the table `user_kit_collections` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."user_kit_collections" ADD COLUMN     "buildId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_kit_collections_buildId_key" ON "public"."user_kit_collections"("buildId");

-- AddForeignKey
ALTER TABLE "public"."user_kit_collections" ADD CONSTRAINT "user_kit_collections_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."builds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
