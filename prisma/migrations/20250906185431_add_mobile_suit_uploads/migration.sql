-- CreateTable
CREATE TABLE "public"."mobile_suit_uploads" (
    "id" TEXT NOT NULL,
    "mobileSuitId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_suit_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mobile_suit_uploads_mobileSuitId_uploadId_key" ON "public"."mobile_suit_uploads"("mobileSuitId", "uploadId");

-- AddForeignKey
ALTER TABLE "public"."mobile_suit_uploads" ADD CONSTRAINT "mobile_suit_uploads_mobileSuitId_fkey" FOREIGN KEY ("mobileSuitId") REFERENCES "public"."mobile_suits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mobile_suit_uploads" ADD CONSTRAINT "mobile_suit_uploads_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "public"."uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
