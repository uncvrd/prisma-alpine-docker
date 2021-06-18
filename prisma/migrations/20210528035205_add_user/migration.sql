-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "apiKey" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.apiKey_unique" ON "User"("apiKey");
