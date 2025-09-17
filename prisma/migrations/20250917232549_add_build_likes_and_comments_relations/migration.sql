-- CreateTable
CREATE TABLE "public"."build_likes" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "build_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "build_likes_buildId_idx" ON "public"."build_likes"("buildId");

-- CreateIndex
CREATE INDEX "build_likes_userId_idx" ON "public"."build_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "build_likes_buildId_userId_key" ON "public"."build_likes"("buildId", "userId");

-- CreateIndex
CREATE INDEX "build_comments_buildId_idx" ON "public"."build_comments"("buildId");

-- CreateIndex
CREATE INDEX "build_comments_userId_idx" ON "public"."build_comments"("userId");

-- CreateIndex
CREATE INDEX "build_comments_createdAt_idx" ON "public"."build_comments"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."build_likes" ADD CONSTRAINT "build_likes_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "public"."builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."build_likes" ADD CONSTRAINT "build_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
