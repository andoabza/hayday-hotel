/*
  Warnings:

  - A unique constraint covering the columns `[roomNumber]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Room` ADD COLUMN `bedType` VARCHAR(191) NOT NULL DEFAULT 'Queen',
    ADD COLUMN `breakfastIncluded` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `cancellationPolicy` VARCHAR(191) NOT NULL DEFAULT 'Free cancellation 48 hours before check-in',
    ADD COLUMN `depositRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `floor` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `maxStay` INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN `minStay` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `parkingAvailable` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `policies` JSON NULL,
    ADD COLUMN `roomNumber` VARCHAR(191) NULL,
    ADD COLUMN `size` INTEGER NOT NULL DEFAULT 25,
    ADD COLUMN `view` VARCHAR(191) NOT NULL DEFAULT 'City View',
    ADD COLUMN `wifiSpeed` VARCHAR(191) NOT NULL DEFAULT '100 Mbps';

-- CreateTable
CREATE TABLE `HotelSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HotelSettings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Room_roomNumber_key` ON `Room`(`roomNumber`);
