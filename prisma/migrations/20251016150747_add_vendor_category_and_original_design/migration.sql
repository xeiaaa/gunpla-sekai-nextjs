-- CreateEnum
CREATE TYPE "public"."VendorCategory" AS ENUM ('OFFICIAL', 'THIRD_PARTY', 'BOOTLEG');

-- AlterTable
ALTER TABLE "public"."kits" ADD COLUMN     "isOriginalDesign" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."vendors" ADD COLUMN     "category" "public"."VendorCategory",
ADD COLUMN     "producesOriginal" BOOLEAN NOT NULL DEFAULT true;
