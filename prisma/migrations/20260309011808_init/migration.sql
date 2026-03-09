-- CreateTable
CREATE TABLE "CodeReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "language" TEXT NOT NULL,
    "filename" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);

-- CreateTable
CREATE TABLE "ReviewResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "readability" INTEGER NOT NULL,
    "structure" INTEGER NOT NULL,
    "maintainability" INTEGER NOT NULL,
    "codeReviewId" TEXT NOT NULL,
    CONSTRAINT "ReviewResult_codeReviewId_fkey" FOREIGN KEY ("codeReviewId") REFERENCES "CodeReview" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lineStart" INTEGER,
    "lineEnd" INTEGER,
    "reviewResultId" TEXT NOT NULL,
    CONSTRAINT "ReviewComment_reviewResultId_fkey" FOREIGN KEY ("reviewResultId") REFERENCES "ReviewResult" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewResult_codeReviewId_key" ON "ReviewResult"("codeReviewId");
