-- AlterTable
ALTER TABLE "public"."mobile_suits" ADD COLUMN     "scrapedImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
