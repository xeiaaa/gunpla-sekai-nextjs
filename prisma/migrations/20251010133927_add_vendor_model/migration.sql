-- AlterTable
ALTER TABLE "public"."product_lines" ADD COLUMN     "vendorId" TEXT,
ALTER COLUMN "gradeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendors_name_key" ON "public"."vendors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "public"."vendors"("slug");

-- AddForeignKey
ALTER TABLE "public"."product_lines" ADD CONSTRAINT "product_lines_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
