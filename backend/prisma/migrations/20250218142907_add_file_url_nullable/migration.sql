/*
  Warnings:

  - You are about to drop the column `filePath` on the `ProcessingLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProcessingLog" DROP COLUMN "filePath",
ADD COLUMN     "fileUrl" TEXT;
