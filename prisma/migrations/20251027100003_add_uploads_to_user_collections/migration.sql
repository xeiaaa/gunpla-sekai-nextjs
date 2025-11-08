-- AlterTable
ALTER TABLE "public"."user_kit_collections" ADD COLUMN     "backlogUploadId" TEXT,
ADD COLUMN     "builtUploadId" TEXT,
ADD COLUMN     "inProgressUploadId" TEXT,
ADD COLUMN     "preorderUploadId" TEXT,
ADD COLUMN     "wishlistUploadId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."user_kit_collections" ADD CONSTRAINT "user_kit_collections_wishlistUploadId_fkey" FOREIGN KEY ("wishlistUploadId") REFERENCES "public"."uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_kit_collections" ADD CONSTRAINT "user_kit_collections_preorderUploadId_fkey" FOREIGN KEY ("preorderUploadId") REFERENCES "public"."uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_kit_collections" ADD CONSTRAINT "user_kit_collections_backlogUploadId_fkey" FOREIGN KEY ("backlogUploadId") REFERENCES "public"."uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_kit_collections" ADD CONSTRAINT "user_kit_collections_inProgressUploadId_fkey" FOREIGN KEY ("inProgressUploadId") REFERENCES "public"."uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_kit_collections" ADD CONSTRAINT "user_kit_collections_builtUploadId_fkey" FOREIGN KEY ("builtUploadId") REFERENCES "public"."uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
