import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (optional - comment out if you want to keep data)
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.event.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hayday.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user');

  // Create regular customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'John Doe',
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Created customer user');

  // Create rooms with all amenities (using JSON arrays)
  const rooms = await prisma.room.createMany({
    data: [
      {
        name: 'Standard Room',
        type: 'Standard',
        capacity: 2,
        basePrice: 1500,
        description: 'Comfortable room with city view, featuring a minibar, coffee maker, and private balcony. Perfect for solo travelers or couples.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427',
        ]),
        amenities: JSON.stringify(['Wi-Fi', 'Minibar', 'Coffee Maker', 'Air Conditioning', 'Flat-screen TV', 'Free Breakfast']),
        hasKitchen: false,
        hasBalcony: true,
      },
      {
        name: 'Deluxe Room',
        type: 'Deluxe',
        capacity: 3,
        basePrice: 2500,
        description: 'Spacious room with extra amenities, separate seating area, and premium city views. Includes upgraded toiletries and bathrobes.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1590490360182-c33d57733427',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        ]),
        amenities: JSON.stringify(['Wi-Fi', 'Minibar', 'Coffee Maker', 'Air Conditioning', 'Flat-screen TV', 'Free Breakfast', 'Bathrobes', 'Seating Area']),
        hasKitchen: false,
        hasBalcony: true,
      },
      {
        name: 'Executive Suite',
        type: 'Suite',
        capacity: 4,
        basePrice: 4500,
        description: 'Luxury suite with living area, kitchenette, and panoramic city views. Perfect for families or extended stays.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
        ]),
        amenities: JSON.stringify(['Wi-Fi', 'Minibar', 'Coffee Maker', 'Air Conditioning', 'Flat-screen TV', 'Free Breakfast', 'Kitchenette', 'Living Area', 'Jacuzzi']),
        hasKitchen: true,
        hasBalcony: true,
      },
    ],
  });
  console.log('✅ Created rooms');

  // Create services
  await prisma.service.createMany({
    data: [
      { name: 'Airport Shuttle', description: '24/7 airport transfer service', price: 500, category: 'transportation', isAvailable: true },
      { name: 'Traditional Coffee Ceremony', description: 'Authentic Ethiopian coffee experience daily from 4-6 PM', price: 0, category: 'dining', isAvailable: true },
      { name: 'Room Service', description: '24-hour in-room dining', price: null, category: 'dining', isAvailable: true },
      { name: 'Laundry Service', description: 'Same-day dry cleaning and laundry', price: null, category: 'other', isAvailable: true },
      { name: 'Spa Treatment', description: 'Full-service spa and wellness center', price: 1500, category: 'wellness', isAvailable: true },
      { name: 'Fitness Center', description: 'Modern gym equipment open 24/7', price: 0, category: 'wellness', isAvailable: true },
      { name: 'Business Center', description: 'Meeting rooms and workstations', price: 0, category: 'business', isAvailable: true },
    ],
  });
  console.log('✅ Created services');

  // Create events (using JSON arrays for images)
  await prisma.event.createMany({
    data: [
      {
        title: 'Ethiopian New Year Celebration',
        description: 'Celebrate Enkutatash with traditional music, dance, and feast. Experience authentic Ethiopian culture with live performances and traditional cuisine.',
        date: new Date('2024-09-11T19:00:00'),
        capacity: 150,
        price: 2500,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7',
          'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf',
        ]),
      },
      {
        title: 'Jazz Night with Local Artists',
        description: 'An evening of Ethiopian jazz featuring top local musicians. Enjoy smooth jazz, fine dining, and premium drinks.',
        date: new Date('2024-06-15T20:00:00'),
        capacity: 80,
        price: 800,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1511192336575-5a79af67a629',
          'https://images.unsplash.com/photo-1421218104859-693e3cdff8a1',
        ]),
      },
      {
        title: 'Wine Tasting Experience',
        description: 'Sample premium Ethiopian wines with expert sommeliers. Learn about Ethiopian winemaking traditions.',
        date: new Date('2024-07-20T18:30:00'),
        capacity: 50,
        price: 1200,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
          'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb',
        ]),
      },
      {
        title: 'Traditional Coffee Ceremony Workshop',
        description: 'Learn the art of Ethiopian coffee ceremony. Includes roasting, grinding, and brewing traditional coffee.',
        date: new Date('2024-08-10T15:00:00'),
        capacity: 20,
        price: 500,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1442512595331-e89e73853f31',
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
        ]),
      },
    ],
  });
  console.log('✅ Created events');

  // Create offers/promotions
  await prisma.offer.createMany({
    data: [
      {
        title: 'Early Bird Discount',
        description: 'Book 30 days in advance and get 15% off',
        discountPercent: 15,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
      },
      {
        title: 'Long Stay Special',
        description: 'Stay 7 nights or more and get 20% off',
        discountPercent: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
      },
      {
        title: 'Weekend Getaway',
        description: 'Special rates for Friday-Sunday stays',
        discountPercent: 10,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
      },
    ],
  });
  console.log('✅ Created offers');

  // Create sample reviews
  await prisma.review.createMany({
    data: [
      { 
        userId: admin.id, 
        rating: 5, 
        comment: 'Amazing hotel! The staff was incredibly friendly and the traditional coffee ceremony was a highlight. The rooms are spacious and clean.' 
      },
      { 
        userId: admin.id, 
        rating: 4, 
        comment: 'Great location, comfortable rooms. The airport shuttle service was very convenient. Breakfast buffet had excellent variety.' 
      },
      { 
        userId: admin.id, 
        rating: 5, 
        comment: 'Best hotel in Addis! The pool area is beautiful and the spa treatments are world-class. Will definitely come back.' 
      },
      { 
        userId: customer.id, 
        rating: 5, 
        comment: 'Exceptional service from check-in to check-out. The staff went above and beyond to make our stay memorable.' 
      },
      { 
        userId: customer.id, 
        rating: 4, 
        comment: 'Very comfortable stay. The room was clean and well-maintained. The location is perfect for exploring the city.' 
      },
    ],
  });
  console.log('✅ Created reviews');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin: admin@hayday.com / admin123');
  console.log('Customer: customer@example.com / customer123');
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });