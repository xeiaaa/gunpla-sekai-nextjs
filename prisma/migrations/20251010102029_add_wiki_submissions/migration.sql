-- CreateEnum
CREATE TYPE "public"."WikiSubmissionType" AS ENUM ('KIT', 'SERIES', 'MOBILE_SUIT', 'PRODUCT_LINE', 'GRADE', 'RELEASE_TYPE', 'TIMELINE');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."wiki_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."WikiSubmissionType" NOT NULL,
    "entityId" TEXT,
    "data" JSONB NOT NULL,
    "notes" TEXT,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "likesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wiki_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wiki_submission_comments" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wiki_submission_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wiki_submission_likes" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wiki_submission_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wiki_submissions_userId_idx" ON "public"."wiki_submissions"("userId");

-- CreateIndex
CREATE INDEX "wiki_submissions_type_idx" ON "public"."wiki_submissions"("type");

-- CreateIndex
CREATE INDEX "wiki_submissions_status_idx" ON "public"."wiki_submissions"("status");

-- CreateIndex
CREATE INDEX "wiki_submissions_entityId_idx" ON "public"."wiki_submissions"("entityId");

-- CreateIndex
CREATE INDEX "wiki_submissions_createdAt_idx" ON "public"."wiki_submissions"("createdAt");

-- CreateIndex
CREATE INDEX "wiki_submission_comments_submissionId_idx" ON "public"."wiki_submission_comments"("submissionId");

-- CreateIndex
CREATE INDEX "wiki_submission_comments_userId_idx" ON "public"."wiki_submission_comments"("userId");

-- CreateIndex
CREATE INDEX "wiki_submission_likes_submissionId_idx" ON "public"."wiki_submission_likes"("submissionId");

-- CreateIndex
CREATE INDEX "wiki_submission_likes_userId_idx" ON "public"."wiki_submission_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wiki_submission_likes_submissionId_userId_key" ON "public"."wiki_submission_likes"("submissionId", "userId");

-- AddForeignKey
ALTER TABLE "public"."wiki_submissions" ADD CONSTRAINT "wiki_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wiki_submissions" ADD CONSTRAINT "wiki_submissions_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wiki_submission_comments" ADD CONSTRAINT "wiki_submission_comments_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."wiki_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wiki_submission_comments" ADD CONSTRAINT "wiki_submission_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wiki_submission_likes" ADD CONSTRAINT "wiki_submission_likes_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."wiki_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wiki_submission_likes" ADD CONSTRAINT "wiki_submission_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
