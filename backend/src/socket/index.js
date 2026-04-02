import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { prisma } from '../index.js';
import { verifyToken } from '../utils/jwt.js';

const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();

export const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    },
    adapter: createAdapter(pubClient, subClient)
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) return next(new Error('User not found'));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join user's personal room
    socket.join(`user:${socket.user.id}`);
    
    // Real-time booking notifications
    socket.on('subscribe:bookings', () => {
      socket.join('bookings');
    });
    
    // Live chat
    socket.on('chat:join', (bookingId) => {
      socket.join(`chat:${bookingId}`);
      socket.emit('chat:joined', { bookingId });
    });
    
    socket.on('chat:message', async (data) => {
      const message = await prisma.message.create({
        data: {
          bookingId: data.bookingId,
          userId: socket.user.id,
          message: data.message,
          isStaff: socket.user.role === 'ADMIN',
          timestamp: new Date()
        },
        include: { user: true }
      });
      
      io.to(`chat:${data.bookingId}`).emit('chat:message', message);
    });
    
    // Room service tracking
    socket.on('room-service:order', async (data) => {
      const order = await prisma.roomServiceOrder.create({
        data: {
          bookingId: data.bookingId,
          items: data.items,
          status: 'PENDING',
          totalAmount: data.totalAmount
        }
      });
      
      io.to(`user:${socket.user.id}`).emit('room-service:order-confirmed', order);
      io.to('staff').emit('room-service:new-order', order);
    });
    
    // Staff notifications
    if (socket.user.role === 'ADMIN') {
      socket.join('staff');
      
      socket.on('staff:assign', async (data) => {
        const assignment = await prisma.staffAssignment.create({
          data: {
            bookingId: data.bookingId,
            staffId: data.staffId,
            task: data.task
          }
        });
        
        io.to(`user:${data.userId}`).emit('staff:assigned', assignment);
      });
    }
    
    // Emergency broadcast
    socket.on('emergency:broadcast', async (data) => {
      if (socket.user.role === 'ADMIN') {
        io.emit('emergency:alert', {
          message: data.message,
          severity: data.severity,
          timestamp: new Date()
        });
        
        await prisma.emergencyLog.create({
          data: {
            message: data.message,
            severity: data.severity,
            userId: socket.user.id
          }
        });
      }
    });
    
    // Check-in/out reminders
    setInterval(async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const checkIns = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          checkIn: { gte: today, lt: tomorrow }
        },
        include: { user: true }
      });
      
      checkIns.forEach(booking => {
        io.to(`user:${booking.userId}`).emit('reminder:check-in', {
          bookingId: booking.id,
          date: booking.checkIn,
          room: booking.room
        });
      });
    }, 3600000); // Every hour
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
  
  return io;
};