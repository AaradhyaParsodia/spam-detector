/*
  Warnings:

  - Made the column `name` on table `names` required. This step will fail if there are existing NULL values in that column.
  - Made the column `globalDBId` on table `names` required. This step will fail if there are existing NULL values in that column.
  - Made the column `globalDBId` on table `spamReport` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "names" DROP CONSTRAINT "names_globalDBId_fkey";

-- DropForeignKey
ALTER TABLE "spamReport" DROP CONSTRAINT "spamReport_globalDBId_fkey";

-- AlterTable
ALTER TABLE "names" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "globalDBId" SET NOT NULL;

-- AlterTable
ALTER TABLE "spamReport" ALTER COLUMN "globalDBId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "names" ADD CONSTRAINT "names_globalDBId_fkey" FOREIGN KEY ("globalDBId") REFERENCES "globalDB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spamReport" ADD CONSTRAINT "spamReport_globalDBId_fkey" FOREIGN KEY ("globalDBId") REFERENCES "globalDB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
