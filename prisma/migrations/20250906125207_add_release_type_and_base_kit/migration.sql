-- AlterTable
ALTER TABLE "public"."kits" ADD COLUMN     "baseKitId" TEXT,
ADD COLUMN     "releaseTypeId" TEXT;

-- CreateTable
CREATE TABLE "public"."release_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "release_types_name_key" ON "public"."release_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "release_types_slug_key" ON "public"."release_types"("slug");

-- AddForeignKey
ALTER TABLE "public"."kits" ADD CONSTRAINT "kits_releaseTypeId_fkey" FOREIGN KEY ("releaseTypeId") REFERENCES "public"."release_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kits" ADD CONSTRAINT "kits_baseKitId_fkey" FOREIGN KEY ("baseKitId") REFERENCES "public"."kits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
