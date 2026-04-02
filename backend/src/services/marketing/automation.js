import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { prisma } from '../../index.js';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export class MarketingAutomation {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendAbandonedCartEmail(userId, bookingData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    
    const emailContent = `
      <h1>Don't Miss Out on Your Booking!</h1>
      <p>Hi ${user.name},</p>
      <p>You left a booking for ${bookingData.roomName} from ${bookingData.checkIn} to ${bookingData.checkOut}.</p>
      <p>Complete your booking within 24 hours and get 10% off!</p>
      <a href="${process.env.FRONTEND_URL}/booking/${bookingData.bookingId}" 
         style="background-color: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Complete Booking
      </a>
    `;
    
    await this.transporter.sendMail({
      from: `"Hayday Hotel" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Complete Your Booking - Get 10% Off!',
      html: emailContent
    });
    
    await prisma.marketingLog.create({
      data: {
        type: 'ABANDONED_CART',
        userId,
        content: JSON.stringify(bookingData),
        sentAt: new Date()
      }
    });
  }

  async sendBirthdayOffers() {
    const today = new Date();
    const users = await prisma.user.findMany({
      where: {
        birthDate: {
          month: today.getMonth(),
          day: today.getDate()
        },
        isActive: true
      }
    });
    
    for (const user of users) {
      const emailContent = `
        <h1>Happy Birthday ${user.name}!</h1>
        <p>As a special gift, enjoy 20% off your next stay at Hayday Hotel!</p>
        <p>Use code: BDAY${user.id} at checkout</p>
        <a href="${process.env.FRONTEND_URL}/rooms" 
           style="background-color: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Book Now
        </a>
      `;
      
      await this.transporter.sendMail({
        from: `"Hayday Hotel" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Happy Birthday from Hayday Hotel! 🎉',
        html: emailContent
      });
      
      // Create unique discount code
      await prisma.discountCode.create({
        data: {
          code: `BDAY${user.id}`,
          userId: user.id,
          discountPercent: 20,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  async sendReEngagementCampaign() {
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastLoginAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        isActive: true
      }
    });
    
    for (const user of inactiveUsers) {
      const emailContent = `
        <h1>We Miss You!</h1>
        <p>Hi ${user.name}, it's been a while since your last visit.</p>
        <p>Come back and enjoy 15% off your next stay!</p>
        <a href="${process.env.FRONTEND_URL}/rooms" 
           style="background-color: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Book Now
        </a>
      `;
      
      await this.transporter.sendMail({
        from: `"Hayday Hotel" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Come Back to Hayday Hotel!',
        html: emailContent
      });
      
      await prisma.marketingLog.create({
        data: {
          type: 'RE_ENGAGEMENT',
          userId: user.id,
          sentAt: new Date()
        }
      });
    }
  }

  async sendSMS(phoneNumber, message) {
    try {
      await twilioClient.messages.create({
        body: message,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      
      console.log(`SMS sent to ${phoneNumber}`);
    } catch (error) {
      console.error('SMS error:', error);
    }
  }

  async runABTest(campaignId, variantA, variantB) {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER', isActive: true },
      take: 1000
    });
    
    const half = Math.ceil(users.length / 2);
    const groupA = users.slice(0, half);
    const groupB = users.slice(half);
    
    // Send variant A
    for (const user of groupA) {
      await this.transporter.sendMail({
        from: `"Hayday Hotel" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: variantA.subject,
        html: variantA.html
      });
    }
    
    // Send variant B
    for (const user of groupB) {
      await this.transporter.sendMail({
        from: `"Hayday Hotel" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: variantB.subject,
        html: variantB.html
      });
    }
    
    await prisma.abTest.create({
      data: {
        campaignId,
        variantA: JSON.stringify(variantA),
        variantB: JSON.stringify(variantB),
        groupASize: groupA.length,
        groupBSize: groupB.length,
        startedAt: new Date()
      }
    });
    
    return { groupASize: groupA.length, groupBSize: groupB.length };
  }
}

export const marketing = new MarketingAutomation();