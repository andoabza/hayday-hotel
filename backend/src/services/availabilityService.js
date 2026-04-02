import { prisma } from '../index.js';
// import { BookingStatus } from '@prisma/client';
import pkg from '@prisma/client';
const { BookingStatus } = pkg;

export const checkRoomAvailability = async (
  roomId,
  checkIn,
  checkOut,
  excludeBookingId
) => {
  const overlappingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      NOT: excludeBookingId ? { id: excludeBookingId } : undefined,
      AND: [
        { checkIn: { lt: checkOut } },
        { checkOut: { gt: checkIn } },
      ],
    },
  });

  return overlappingBookings.length === 0;
};

export const getAvailableRooms = async (
  checkIn,
  checkOut,
  capacity
) => {
  const allRooms = await prisma.room.findMany({
    where: capacity ? { capacity: { gte: capacity } } : {},
  });

  const availableRooms = [];
  for (const room of allRooms) {
    const isAvailable = await checkRoomAvailability(room.id, checkIn, checkOut);
    if (isAvailable) {
      availableRooms.push(room);
    }
  }
  return availableRooms;
};
