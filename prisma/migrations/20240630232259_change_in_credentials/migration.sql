/*
  Warnings:

  - You are about to drop the column `salt` on the `credentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "credentials" DROP COLUMN "salt";

-- CreateIndex
CREATE UNIQUE INDEX "users_number_key" ON "users"("number");
