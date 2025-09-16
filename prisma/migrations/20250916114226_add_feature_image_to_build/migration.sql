-- AlterTable
ALTER TABLE "public"."builds" ADD COLUMN     "featuredImageId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."builds" ADD CONSTRAINT "builds_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "public"."uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
