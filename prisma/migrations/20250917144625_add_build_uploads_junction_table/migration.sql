-- CreateTable
CREATE TABLE "public"."build_uploads" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "build_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "build_uploads_buildId_uploadId_key" ON "public"."build_uploads"("buildId", "uploadId");

-- AddForeignKey
ALTER TABLE "public"."build_uploads" ADD CONSTRAINT "build_uploads_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."build_uploads" ADD CONSTRAINT "build_uploads_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "public"."uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
