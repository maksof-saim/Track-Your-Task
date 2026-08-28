/*
  Warnings:

  - A unique constraint covering the columns `[userId,date,section,customTilawatId]` on the table `ChecklistLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,date,section,customHifazatId]` on the table `ChecklistLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,date,customPrayerId]` on the table `PrayerLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,date,customZikrId]` on the table `ZikrLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChecklistLog" ADD COLUMN     "customHifazatId" TEXT,
ADD COLUMN     "customTilawatId" TEXT;

-- AlterTable
ALTER TABLE "PrayerLog" ADD COLUMN     "customPrayerId" TEXT,
ALTER COLUMN "prayer" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ZikrLog" ADD COLUMN     "customZikrId" TEXT;

-- CreateTable
CREATE TABLE "CustomPrayer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPrayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomZikr" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hasCount" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomZikr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTilawat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTilawat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomHifazat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomHifazat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomPrayer_userId_idx" ON "CustomPrayer"("userId");

-- CreateIndex
CREATE INDEX "CustomZikr_userId_idx" ON "CustomZikr"("userId");

-- CreateIndex
CREATE INDEX "CustomTilawat_userId_idx" ON "CustomTilawat"("userId");

-- CreateIndex
CREATE INDEX "CustomHifazat_userId_idx" ON "CustomHifazat"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistLog_userId_date_section_customTilawatId_key" ON "ChecklistLog"("userId", "date", "section", "customTilawatId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistLog_userId_date_section_customHifazatId_key" ON "ChecklistLog"("userId", "date", "section", "customHifazatId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerLog_userId_date_customPrayerId_key" ON "PrayerLog"("userId", "date", "customPrayerId");

-- CreateIndex
CREATE UNIQUE INDEX "ZikrLog_userId_date_customZikrId_key" ON "ZikrLog"("userId", "date", "customZikrId");

-- AddForeignKey
ALTER TABLE "PrayerLog" ADD CONSTRAINT "PrayerLog_customPrayerId_fkey" FOREIGN KEY ("customPrayerId") REFERENCES "CustomPrayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZikrLog" ADD CONSTRAINT "ZikrLog_customZikrId_fkey" FOREIGN KEY ("customZikrId") REFERENCES "CustomZikr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistLog" ADD CONSTRAINT "ChecklistLog_customTilawatId_fkey" FOREIGN KEY ("customTilawatId") REFERENCES "CustomTilawat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistLog" ADD CONSTRAINT "ChecklistLog_customHifazatId_fkey" FOREIGN KEY ("customHifazatId") REFERENCES "CustomHifazat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPrayer" ADD CONSTRAINT "CustomPrayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomZikr" ADD CONSTRAINT "CustomZikr_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTilawat" ADD CONSTRAINT "CustomTilawat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomHifazat" ADD CONSTRAINT "CustomHifazat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
