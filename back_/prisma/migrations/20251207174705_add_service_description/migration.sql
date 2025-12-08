-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE INDEX "AvailabilitySlot_serviceId_status_idx" ON "AvailabilitySlot"("serviceId", "status");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_startAt_idx" ON "AvailabilitySlot"("startAt");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_status_idx" ON "AvailabilitySlot"("status");

-- CreateIndex
CREATE INDEX "Booking_userId_status_idx" ON "Booking"("userId", "status");

-- CreateIndex
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_cancelToken_idx" ON "Booking"("cancelToken");

-- CreateIndex
CREATE INDEX "Service_providerId_idx" ON "Service"("providerId");

-- CreateIndex
CREATE INDEX "Service_name_idx" ON "Service"("name");

-- CreateIndex
CREATE INDEX "Service_createdAt_idx" ON "Service"("createdAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
