-- CreateTable
CREATE TABLE "public"."user_wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_wishlist_userId_idx" ON "public"."user_wishlist"("userId");

-- CreateIndex
CREATE INDEX "user_wishlist_kitId_idx" ON "public"."user_wishlist"("kitId");

-- CreateIndex
CREATE UNIQUE INDEX "user_wishlist_userId_kitId_key" ON "public"."user_wishlist"("userId", "kitId");

-- AddForeignKey
ALTER TABLE "public"."user_wishlist" ADD CONSTRAINT "user_wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_wishlist" ADD CONSTRAINT "user_wishlist_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
