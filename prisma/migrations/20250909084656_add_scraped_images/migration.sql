-- AlterTable
ALTER TABLE "public"."kits" ADD COLUMN     "scrapedImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."product_lines" ADD COLUMN     "scrapedImage" TEXT;

-- AlterTable
ALTER TABLE "public"."series" ADD COLUMN     "scrapedImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
