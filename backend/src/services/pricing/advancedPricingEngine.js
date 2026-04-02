import { prisma } from '../../index.js';
import moment from 'moment';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class AdvancedPricingEngine {
  constructor() {
    this.seasonalMultipliers = {
      PEAK: 1.3,      // Nov-Jan
      HIGH: 1.15,     // Feb-Apr, Sep-Oct
      NORMAL: 1.0,    // May, Aug
      OFF: 0.8        // Jun-Jul
    };
    
    this.holidays = [
      '2024-01-01', '2024-01-07', '2024-03-02', '2024-04-16',
      '2024-05-01', '2024-05-05', '2024-09-11', '2024-09-27',
      '2024-12-25'
    ];
    
    this.childDiscounts = {
      UNDER_2: 1.0,    // 100% off (free)
      UNDER_12: 0.5,   // 50% off
      ADULT: 0         // No discount
    };
  }

  getSeason(date) {
    const month = date.getMonth();
    if (month >= 10 || month <= 0) return 'PEAK';
    if (month >= 1 && month <= 3) return 'HIGH';
    if (month >= 8 && month <= 9) return 'HIGH';
    if (month >= 5 && month <= 6) return 'OFF';
    return 'NORMAL';
  }

  isHoliday(date) {
    const dateStr = moment(date).format('YYYY-MM-DD');
    return this.holidays.includes(dateStr);
  }

  isWeekend(date) {
    const day = date.getDay();
    return day === 5 || day === 6;
  }

  getMinimumStay(date) {
    if (this.isHoliday(date)) return 3;
    if (this.isWeekend(date)) return 2;
    return 1;
  }

  async getLoyaltyDiscount(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { bookings: { where: { status: 'COMPLETED' } } }
    });
    
    const completedStays = user.bookings.length;
    
    if (completedStays >= 10) return 0.20;  // 20% off after 10 stays
    if (completedStays >= 5) return 0.15;   // 15% off after 5 stays
    if (completedStays >= 3) return 0.10;   // 10% off after 3 stays
    return 0;
  }

  async getAvailabilityCalendar(roomId, startDate, endDate) {
    const cacheKey = `calendar:${roomId}:${startDate}:${endDate}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const bookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          { checkIn: { lte: new Date(endDate), gte: new Date(startDate) } },
          { checkOut: { lte: new Date(endDate), gte: new Date(startDate) } }
        ]
      }
    });
    
    const calendar = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= new Date(endDate)) {
      const dateStr = moment(currentDate).format('YYYY-MM-DD');
      const isBooked = bookings.some(booking => 
        currentDate >= booking.checkIn && currentDate < booking.checkOut
      );
      
      const nightlyPrice = await this.calculateNightlyPrice(roomId, currentDate);
      const minStay = this.getMinimumStay(currentDate);
      
      calendar.push({
        date: dateStr,
        available: !isBooked,
        price: nightlyPrice,
        minStay,
        isWeekend: this.isWeekend(currentDate),
        isHoliday: this.isHoliday(currentDate)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    await redis.setex(cacheKey, 3600, JSON.stringify(calendar));
    return calendar;
  }

  async calculateNightlyPrice(roomId, date, userId = null, roomsCount = 1) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error('Room not found');
    
    let price = room.basePrice;
    
    // Seasonal pricing
    const season = this.getSeason(date);
    price *= this.seasonalMultipliers[season];
    
    // Holiday pricing
    if (this.isHoliday(date)) {
      price *= 1.5;
    }
    
    // Weekend pricing
    if (this.isWeekend(date)) {
      price *= 1.2;
    }
    
    // Last-minute deal (within 3 days)
    const daysUntilBooking = moment(date).diff(moment(), 'days');
    if (daysUntilBooking <= 3 && daysUntilBooking >= 0) {
      price *= 0.85;
    }
    
    // Loyalty discount
    if (userId) {
      const loyaltyDiscount = await this.getLoyaltyDiscount(userId);
      price *= (1 - loyaltyDiscount);
    }
    
    // Group booking discount
    if (roomsCount >= 3) {
      price *= 0.9;
    }
    
    return Math.round(price);
  }

  async calculateTotalPrice(roomId, checkIn, checkOut, adults, children, userId = null, roomsCount = 1) {
    let totalPrice = 0;
    const nights = moment(checkOut).diff(moment(checkIn), 'days');
    let currentDate = new Date(checkIn);
    
    for (let i = 0; i < nights; i++) {
      let nightlyPrice = await this.calculateNightlyPrice(roomId, currentDate, userId, roomsCount);
      
      // Apply child discounts
      const childrenUnder2 = children.filter(c => c.age < 2).length;
      const childrenUnder12 = children.filter(c => c.age >= 2 && c.age < 12).length;
      
      const adultPrice = nightlyPrice * adults;
      const childUnder2Price = nightlyPrice * childrenUnder2 * this.childDiscounts.UNDER_2;
      const childUnder12Price = nightlyPrice * childrenUnder12 * this.childDiscounts.UNDER_12;
      
      nightlyPrice = (adultPrice + childUnder2Price + childUnder12Price) / (adults + children.length);
      
      totalPrice += nightlyPrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return Math.round(totalPrice);
  }
}

export const pricingEngine = new AdvancedPricingEngine();