-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'NOT_SUBMITTED');

-- AlterTable
ALTER TABLE "AttendanceLog" ADD COLUMN     "applicationNote" TEXT,
ADD COLUMN     "applicationStatus" "ApplicationStatus";
