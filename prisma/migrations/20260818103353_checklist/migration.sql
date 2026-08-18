-- CreateEnum
CREATE TYPE "ChecklistSection" AS ENUM ('TILAWAT', 'HIFAZAT');

-- CreateTable
CREATE TABLE "ChecklistLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "section" "ChecklistSection" NOT NULL,
    "item" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChecklistLog_userId_date_section_idx" ON "ChecklistLog"("userId", "date", "section");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistLog_userId_date_section_item_key" ON "ChecklistLog"("userId", "date", "section", "item");

-- AddForeignKey
ALTER TABLE "ChecklistLog" ADD CONSTRAINT "ChecklistLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
