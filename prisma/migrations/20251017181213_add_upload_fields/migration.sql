-- AlterTable
ALTER TABLE "public"."grades" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."product_lines" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."release_types" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."series" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."vendors" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT;
