-- CreateEnum
CREATE TYPE "public"."CollectionStatus" AS ENUM ('WISHLIST', 'BACKLOG', 'BUILT');

-- CreateEnum
CREATE TYPE "public"."ReviewCategory" AS ENUM ('BUILD_QUALITY_ENGINEERING', 'ARTICULATION_POSEABILITY', 'DETAIL_ACCURACY', 'AESTHETICS_PROPORTIONS', 'ACCESSORIES_GIMMICKS', 'VALUE_EXPERIENCE');

-- CreateEnum
CREATE TYPE "public"."BuildStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."MilestoneType" AS ENUM ('ACQUISITION', 'PLANNING', 'BUILD', 'PAINTING', 'PANEL_LINING', 'DECALS', 'TOPCOAT', 'PHOTOGRAPHY', 'COMPLETION');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "avatarUrl" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_kit_collections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "status" "public"."CollectionStatus" NOT NULL,
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_kit_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review_scores" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "category" "public"."ReviewCategory" NOT NULL,
    "score" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "review_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."builds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."BuildStatus" NOT NULL DEFAULT 'PLANNING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."build_milestones" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "type" "public"."MilestoneType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "build_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."build_comments" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "build_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_stores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketplace_listings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JPY',
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "user_kit_collections_userId_idx" ON "public"."user_kit_collections"("userId");

-- CreateIndex
CREATE INDEX "user_kit_collections_kitId_idx" ON "public"."user_kit_collections"("kitId");

-- CreateIndex
CREATE INDEX "user_kit_collections_status_idx" ON "public"."user_kit_collections"("status");

-- CreateIndex
CREATE INDEX "user_kit_collections_userId_status_idx" ON "public"."user_kit_collections"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_kit_collections_userId_kitId_key" ON "public"."user_kit_collections"("userId", "kitId");

-- CreateIndex
CREATE INDEX "reviews_kitId_idx" ON "public"."reviews"("kitId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "public"."reviews"("userId");

-- CreateIndex
CREATE INDEX "reviews_overallScore_idx" ON "public"."reviews"("overallScore");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "public"."reviews"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_userId_kitId_key" ON "public"."reviews"("userId", "kitId");

-- CreateIndex
CREATE UNIQUE INDEX "review_scores_reviewId_category_key" ON "public"."review_scores"("reviewId", "category");

-- CreateIndex
CREATE INDEX "builds_userId_idx" ON "public"."builds"("userId");

-- CreateIndex
CREATE INDEX "builds_kitId_idx" ON "public"."builds"("kitId");

-- CreateIndex
CREATE INDEX "builds_status_idx" ON "public"."builds"("status");

-- CreateIndex
CREATE INDEX "builds_createdAt_idx" ON "public"."builds"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_stores_userId_key" ON "public"."user_stores"("userId");

-- CreateIndex
CREATE INDEX "marketplace_listings_storeId_idx" ON "public"."marketplace_listings"("storeId");

-- CreateIndex
CREATE INDEX "marketplace_listings_kitId_idx" ON "public"."marketplace_listings"("kitId");

-- CreateIndex
CREATE INDEX "marketplace_listings_available_idx" ON "public"."marketplace_listings"("available");

-- CreateIndex
CREATE INDEX "marketplace_listings_price_idx" ON "public"."marketplace_listings"("price");

-- CreateIndex
CREATE INDEX "marketplace_listings_createdAt_idx" ON "public"."marketplace_listings"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."user_kit_collections" ADD CONSTRAINT "user_kit_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_kit_collections" ADD CONSTRAINT "user_kit_collections_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_scores" ADD CONSTRAINT "review_scores_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."builds" ADD CONSTRAINT "builds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."builds" ADD CONSTRAINT "builds_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."build_milestones" ADD CONSTRAINT "build_milestones_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."build_comments" ADD CONSTRAINT "build_comments_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."build_comments" ADD CONSTRAINT "build_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_stores" ADD CONSTRAINT "user_stores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_listings" ADD CONSTRAINT "marketplace_listings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."user_stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketplace_listings" ADD CONSTRAINT "marketplace_listings_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
