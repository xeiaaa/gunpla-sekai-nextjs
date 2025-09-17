/*
  Warnings:

  - You are about to drop the column `defaultSortOrder` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `kitReleaseAlerts` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTimeline` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "defaultSortOrder",
DROP COLUMN "kitReleaseAlerts",
DROP COLUMN "preferredTimeline";

-- CreateTable
CREATE TABLE "public"."review_feedback" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_feedback_reviewId_userId_key" ON "public"."review_feedback"("reviewId", "userId");

-- AddForeignKey
ALTER TABLE "public"."review_feedback" ADD CONSTRAINT "review_feedback_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_feedback" ADD CONSTRAINT "review_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
