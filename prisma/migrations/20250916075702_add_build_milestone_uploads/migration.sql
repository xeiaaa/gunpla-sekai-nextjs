-- CreateTable
CREATE TABLE "public"."build_milestone_uploads" (
    "id" TEXT NOT NULL,
    "buildMilestoneId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "build_milestone_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "build_milestone_uploads_buildMilestoneId_uploadId_key" ON "public"."build_milestone_uploads"("buildMilestoneId", "uploadId");

-- AddForeignKey
ALTER TABLE "public"."build_milestone_uploads" ADD CONSTRAINT "build_milestone_uploads_buildMilestoneId_fkey" FOREIGN KEY ("buildMilestoneId") REFERENCES "public"."build_milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."build_milestone_uploads" ADD CONSTRAINT "build_milestone_uploads_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "public"."uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
