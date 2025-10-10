-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('INVESTMENT', 'BORROWING');

-- AlterEnum
ALTER TYPE "Recommendation" ADD VALUE 'BORROW';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "borrowingCost" DOUBLE PRECISION,
ADD COLUMN     "investmentReturn" DOUBLE PRECISION,
ADD COLUMN     "rateType" "RateType",
ADD COLUMN     "userRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "defaultBorrowingRate" DOUBLE PRECISION,
ADD COLUMN     "defaultInvestmentRate" DOUBLE PRECISION,
ADD COLUMN     "defaultRateType" "RateType" DEFAULT 'INVESTMENT';
