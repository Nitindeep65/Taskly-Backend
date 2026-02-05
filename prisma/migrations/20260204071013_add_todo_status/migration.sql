/*
  Warnings:

  - You are about to drop the column `priority` on the `Todo` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TodoStatus" AS ENUM ('URGENT', 'ONGOING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "priority",
ADD COLUMN     "status" "TodoStatus" NOT NULL DEFAULT 'ONGOING';
