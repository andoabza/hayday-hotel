import { prisma } from '../../index.js';
import Redis from 'ioredis';
import axios from 'axios';

const redis = new Redis(process.env.REDIS_URL);

export class MLAnalytics {
  constructor() {
    this.mlEndpoint = process.env.ML_API_ENDPOINT;
  }

  async forecastRevenue(days = 30) {
    const cacheKey = `forecast:revenue:${days}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const historicalData = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      },
      select: {
        totalPrice: true,
        createdAt: true
      }
    });
    
    // Simple ML prediction using time series
    const dailyRevenue = {};
    historicalData.forEach(booking => {
      const date = booking.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + booking.totalPrice;
    });
    
    const dates = Object.keys(dailyRevenue).sort();
    const values = dates.map(d => dailyRevenue[d]);
    
    // Linear regression for forecasting
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const forecast = [];
    for (let i = 1; i <= days; i++) {
      const predicted = slope * (n + i) + intercept;
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedRevenue: Math.max(0, Math.round(predicted)),
        confidence: 0.85
      });
    }
    
    await redis.setex(cacheKey, 86400, JSON.stringify(forecast));
    return forecast;
  }

  async calculateCustomerLifetimeValue(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { totalPrice: true, createdAt: true }
        }
      }
    });
    
    if (!user) return 0;
    
    const totalSpent = user.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const avgOrderValue = totalSpent / user.bookings.length;
    const purchaseFrequency = user.bookings.length / 365; // per day
    const customerLifespan = 365 * 3; // 3 years average
    
    const clv = avgOrderValue * purchaseFrequency * customerLifespan;
    
    await prisma.user.update({
      where: { id: userId },
      data: { customerLifetimeValue: clv }
    });
    
    return clv;
  }

  async predictChurn(days = 30) {
    const users = await prisma.user.findMany({
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    
    const churnPredictions = [];
    
    for (const user of users) {
      const lastBooking = user.bookings[0];
      if (!lastBooking) {
        churnPredictions.push({ userId: user.id, churnProbability: 0.9 });
        continue;
      }
      
      const daysSinceLastBooking = (Date.now() - lastBooking.createdAt) / (1000 * 60 * 60 * 24);
      let probability = 0;
      
      if (daysSinceLastBooking > 180) probability = 0.8;
      else if (daysSinceLastBooking > 90) probability = 0.5;
      else if (daysSinceLastBooking > 30) probability = 0.3;
      else probability = 0.1;
      
      churnPredictions.push({
        userId: user.id,
        email: user.email,
        name: user.name,
        churnProbability: probability,
        daysSinceLastBooking
      });
    }
    
    return churnPredictions.sort((a, b) => b.churnProbability - a.churnProbability);
  }

  async getHeatMapData(startDate, endDate) {
    const bookings = await prisma.booking.findMany({
      where: {
        checkIn: { gte: startDate, lte: endDate },
        status: 'CONFIRMED'
      },
      include: { room: true }
    });
    
    const heatData = {};
    bookings.forEach(booking => {
      const date = booking.checkIn.toISOString().split('T')[0];
      if (!heatData[date]) heatData[date] = {};
      heatData[date][booking.roomId] = (heatData[date][booking.roomId] || 0) + 1;
    });
    
    const rooms = await prisma.room.findMany();
    const heatMap = [];
    
    for (const [date, roomData] of Object.entries(heatData)) {
      for (const room of rooms) {
        heatMap.push({
          date,
          roomId: room.id,
          roomName: room.name,
          bookings: roomData[room.id] || 0,
          intensity: Math.min(1, (roomData[room.id] || 0) / 10)
        });
      }
    }
    
    return heatMap;
  }
}

export const mlAnalytics = new MLAnalytics();