-- CreateEnum
CREATE TYPE "public"."KitExpansionType" AS ENUM ('EFFECT_PARTS', 'WEAPON_SET', 'ARMOR_EQUIPMENT_PACK', 'CONVERSION_UPGRADE_PARTS', 'BASE_STAND', 'FULL_OPTION_CUSTOMIZATION_PACK', 'CAMPAIGN_LIMITED_ADDON');

-- CreateTable
CREATE TABLE "public"."kit_relations" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "expansionId" TEXT NOT NULL,
    "type" "public"."KitExpansionType",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kit_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kit_relations_kitId_idx" ON "public"."kit_relations"("kitId");

-- CreateIndex
CREATE INDEX "kit_relations_expansionId_idx" ON "public"."kit_relations"("expansionId");

-- CreateIndex
CREATE INDEX "kit_relations_type_idx" ON "public"."kit_relations"("type");

-- CreateIndex
CREATE UNIQUE INDEX "kit_relations_kitId_expansionId_key" ON "public"."kit_relations"("kitId", "expansionId");

-- AddForeignKey
ALTER TABLE "public"."kit_relations" ADD CONSTRAINT "kit_relations_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kit_relations" ADD CONSTRAINT "kit_relations_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "public"."kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
