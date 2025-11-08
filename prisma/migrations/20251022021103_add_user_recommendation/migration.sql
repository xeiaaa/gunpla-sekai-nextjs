-- CreateTable
CREATE TABLE "public"."user_recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_recommendation_userId_idx" ON "public"."user_recommendation"("userId");

-- CreateIndex
CREATE INDEX "user_recommendation_kitId_idx" ON "public"."user_recommendation"("kitId");

-- CreateIndex
CREATE UNIQUE INDEX "user_recommendation_userId_kitId_key" ON "public"."user_recommendation"("userId", "kitId");

-- AddForeignKey
ALTER TABLE "public"."user_recommendation" ADD CONSTRAINT "user_recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_recommendation" ADD CONSTRAINT "user_recommendation_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
