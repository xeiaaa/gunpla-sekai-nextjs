-- CreateTable
CREATE TABLE "public"."gunpla_cards" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gunpla_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gunpla_cards_uploadId_key" ON "public"."gunpla_cards"("uploadId");

-- CreateIndex
CREATE UNIQUE INDEX "gunpla_cards_userId_kitId_key" ON "public"."gunpla_cards"("userId", "kitId");

-- AddForeignKey
ALTER TABLE "public"."gunpla_cards" ADD CONSTRAINT "gunpla_cards_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "public"."uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gunpla_cards" ADD CONSTRAINT "gunpla_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gunpla_cards" ADD CONSTRAINT "gunpla_cards_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
