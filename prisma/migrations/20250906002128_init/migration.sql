-- CreateTable
CREATE TABLE "public"."timelines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "timelineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mobile_suits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "seriesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_suits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grades" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gradeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kits" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "variant" TEXT,
    "releaseDate" TIMESTAMP(3),
    "priceYen" INTEGER,
    "region" TEXT,
    "boxArt" TEXT,
    "notes" TEXT,
    "manualLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gradeId" TEXT NOT NULL,
    "productLineId" TEXT,
    "mobileSuitId" TEXT,
    "seriesId" TEXT,
    "timelineId" TEXT,

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timelines_name_key" ON "public"."timelines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "series_name_key" ON "public"."series"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_suits_name_key" ON "public"."mobile_suits"("name");

-- CreateIndex
CREATE UNIQUE INDEX "grades_name_key" ON "public"."grades"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_lines_name_key" ON "public"."product_lines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "kits_number_key" ON "public"."kits"("number");

-- AddForeignKey
ALTER TABLE "public"."series" ADD CONSTRAINT "series_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "public"."timelines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mobile_suits" ADD CONSTRAINT "mobile_suits_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_lines" ADD CONSTRAINT "product_lines_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kits" ADD CONSTRAINT "kits_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kits" ADD CONSTRAINT "kits_productLineId_fkey" FOREIGN KEY ("productLineId") REFERENCES "public"."product_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kits" ADD CONSTRAINT "kits_mobileSuitId_fkey" FOREIGN KEY ("mobileSuitId") REFERENCES "public"."mobile_suits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kits" ADD CONSTRAINT "kits_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kits" ADD CONSTRAINT "kits_timelineId_fkey" FOREIGN KEY ("timelineId") REFERENCES "public"."timelines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
