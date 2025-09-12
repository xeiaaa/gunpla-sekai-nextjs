-- AlterTable
ALTER TABLE "public"."product_lines" ADD COLUMN     "logoId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."product_lines" ADD CONSTRAINT "product_lines_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "public"."uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
