/*
  Warnings:

  - You are about to drop the column `notes` on the `user_kit_collections` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."user_kit_collections_userId_kitId_key";

-- AlterTable
ALTER TABLE "public"."user_kit_collections" DROP COLUMN "notes",
ADD COLUMN     "backlogNotes" TEXT,
ADD COLUMN     "builtNotes" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "inProgressNotes" TEXT,
ADD COLUMN     "preorderNotes" TEXT,
ADD COLUMN     "preorderedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "wishlistNotes" TEXT,
ADD COLUMN     "wishlistedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_kit_collections_userId_kitId_idx" ON "public"."user_kit_collections"("userId", "kitId");
