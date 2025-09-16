/*
  Warnings:

  - You are about to drop the column `gradeId` on the `kits` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."kits" DROP CONSTRAINT "kits_gradeId_fkey";

-- AlterTable
ALTER TABLE "public"."kits" DROP COLUMN "gradeId";
