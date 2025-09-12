-- CreateEnum
CREATE TYPE "public"."KitImageType" AS ENUM ('BOX_ART', 'PRODUCT_SHOTS', 'RUNNERS', 'MANUAL', 'PROTOTYPE');

-- CreateTable
CREATE TABLE "public"."uploads" (
    "id" TEXT NOT NULL,
    "cloudinaryAssetId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "eagerUrl" TEXT,
    "format" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "pages" INTEGER,
    "originalFilename" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kit_uploads" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER,
    "type" "public"."KitImageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploads_cloudinaryAssetId_key" ON "public"."uploads"("cloudinaryAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "kit_uploads_kitId_uploadId_key" ON "public"."kit_uploads"("kitId", "uploadId");

-- AddForeignKey
ALTER TABLE "public"."kit_uploads" ADD CONSTRAINT "kit_uploads_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kit_uploads" ADD CONSTRAINT "kit_uploads_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "public"."uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
