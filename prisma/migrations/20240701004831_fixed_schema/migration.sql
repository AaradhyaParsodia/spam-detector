/*
  Warnings:

  - You are about to drop the `numbers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[number]` on the table `globalDB` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `globalDB` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "numbers" DROP CONSTRAINT "numbers_globalDBId_fkey";

-- DropForeignKey
ALTER TABLE "spamReport" DROP CONSTRAINT "spamReport_numberId_fkey";

-- AlterTable
ALTER TABLE "globalDB" ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "registeredUserId" INTEGER;

-- AlterTable
ALTER TABLE "spamReport" ADD COLUMN     "globalDBId" INTEGER;

-- DropTable
DROP TABLE "numbers";

-- CreateTable
CREATE TABLE "Names" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "globalDBId" INTEGER,

    CONSTRAINT "Names_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "globalDB_number_key" ON "globalDB"("number");

-- AddForeignKey
ALTER TABLE "globalDB" ADD CONSTRAINT "globalDB_registeredUserId_fkey" FOREIGN KEY ("registeredUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Names" ADD CONSTRAINT "Names_globalDBId_fkey" FOREIGN KEY ("globalDBId") REFERENCES "globalDB"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spamReport" ADD CONSTRAINT "spamReport_globalDBId_fkey" FOREIGN KEY ("globalDBId") REFERENCES "globalDB"("id") ON DELETE SET NULL ON UPDATE CASCADE;
