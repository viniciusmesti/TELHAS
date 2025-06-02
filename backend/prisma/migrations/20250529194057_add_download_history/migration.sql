-- CreateTable
CREATE TABLE "DownloadHistory" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadHistory_pkey" PRIMARY KEY ("id")
);
