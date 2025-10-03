/*
  Warnings:

  - You are about to drop the column `tenantId` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the userId column as nullable
ALTER TABLE "Invoice" ADD COLUMN "userId" TEXT;

-- Update existing invoices to use the temp-user-id
UPDATE "Invoice" SET "userId" = 'temp-user-id' WHERE "userId" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "Invoice" ALTER COLUMN "userId" SET NOT NULL;

-- Drop the old tenantId column
ALTER TABLE "Invoice" DROP COLUMN "tenantId";

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
