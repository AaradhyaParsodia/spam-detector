/*
  Warnings:

  - You are about to drop the column `numberId` on the `spamReport` table. All the data in the column will be lost.
  - You are about to drop the `Names` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Names" DROP CONSTRAINT "Names_globalDBId_fkey";

-- AlterTable
ALTER TABLE "spamReport" DROP COLUMN "numberId";

-- DropTable
DROP TABLE "Names";

-- CreateTable
CREATE TABLE "names" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "globalDBId" INTEGER,

    CONSTRAINT "names_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "names" ADD CONSTRAINT "names_globalDBId_fkey" FOREIGN KEY ("globalDBId") REFERENCES "globalDB"("id") ON DELETE SET NULL ON UPDATE CASCADE;
