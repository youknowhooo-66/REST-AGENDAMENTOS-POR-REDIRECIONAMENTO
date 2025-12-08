/*
  Warnings:

  - You are about to drop the column `bookingId` on the `AvailabilitySlot` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AvailabilitySlot_bookingId_key";

-- DropIndex
DROP INDEX "Booking_slotId_key";

-- AlterTable
ALTER TABLE "AvailabilitySlot" DROP COLUMN "bookingId";
