-- AddForeignKey
ALTER TABLE "public"."uploads" ADD CONSTRAINT "uploads_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
