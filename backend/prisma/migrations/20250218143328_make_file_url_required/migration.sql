/*
  Warnings:

  - Made the column `fileUrl` on table `ProcessingLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProcessingLog" ALTER COLUMN "fileUrl" SET NOT NULL;
