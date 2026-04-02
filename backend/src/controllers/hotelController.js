import { prisma } from '../index.js';

// Hotel information with all amenities
export const getHotelInfo = async (req, res) => {
  try {
    const hotelInfo = {
      name: 'Hayday Hotel',
      description: 'In a residential area, this relaxed hotel offers comfort and convenience for both business and leisure travelers.',
      location: {
        address: 'Bole Sub-city, Woreda 03, Addis Ababa, Ethiopia',
        distanceToAirport: '7 km from Bole International Airport',
        distanceToMuseum: '10 km from the National Museum of Ethiopia',
        distanceToMarket: '11 km from Merkato Express market',
        mapUrl: 'https://maps.google.com/?q=9.022679,38.746804',
      },
      amenities: {
        free: [
          { name: 'Wi-Fi', icon: 'wifi', description: 'High-speed internet throughout the hotel' },
          { name: 'Breakfast', icon: 'coffee', description: 'Complimentary continental breakfast' },
          { name: 'Parking', icon: 'parking', description: 'Free private parking on site' },
          { name: 'Air Conditioning', icon: 'ac', description: 'Climate control in all rooms' },
          { name: 'Coffee/Tea Maker', icon: 'coffee-maker', description: 'In-room coffee and tea facilities' },
        ],
        paid: [
          { name: 'Airport Shuttle', icon: 'shuttle', description: '24/7 airport transfer service', price: '500 ETB' },
          { name: 'Laundry Service', icon: 'laundry', description: 'Same-day dry cleaning and laundry', price: 'Varies' },
          { name: 'Room Service', icon: 'room-service', description: '24-hour in-room dining', price: 'Menu prices apply' },
          { name: 'Spa', icon: 'spa', description: 'Full-service spa and wellness center', price: 'From 1500 ETB' },
          { name: 'Fitness Center', icon: 'fitness', description: 'Modern gym equipment', price: 'Free for guests' },
        ],
        facilities: [
          { name: 'Outdoor Pool', icon: 'pool', description: 'Seasonal outdoor swimming pool' },
          { name: 'Restaurant', icon: 'restaurant', description: 'Traditional and international cuisine' },
          { name: 'Bar', icon: 'bar', description: 'Two bars with signature cocktails' },
          { name: 'Business Center', icon: 'business', description: 'Meeting rooms and workstations' },
          { name: 'Event Space', icon: 'event', description: 'Conference halls and banquet rooms' },
          { name: 'Terrace', icon: 'terrace', description: 'Outdoor seating with garden views' },
          { name: 'Traditional Coffee Ceremony', icon: 'coffee-ceremony', description: 'Authentic Ethiopian coffee experience' },
        ],
      },
      services: [
        { name: 'Airport Shuttle', price: '500 ETB', duration: '24/7', bookingRequired: true },
        { name: 'Traditional Coffee Ceremony', price: 'Free', duration: 'Daily 4-6 PM', bookingRequired: false },
        { name: 'Room Service', price: 'Menu prices', duration: '24 hours', bookingRequired: false },
        { name: 'Laundry Service', price: 'Varies', duration: 'Same day', bookingRequired: true },
        { name: 'Spa Treatments', price: 'From 1500 ETB', duration: '10 AM - 10 PM', bookingRequired: true },
      ],
      policies: {
        checkIn: '14:00',
        checkOut: '12:00',
        pets: 'Pets are allowed on request (charges may apply)',
        cancellation: 'Free cancellation up to 48 hours before check-in',
        payment: 'Cash, credit cards, and mobile money accepted',
      },
      contact: {
        phone: '+251 911 123 456',
        email: 'reservations@haydayhotel.com',
        website: 'www.haydayhotel.com',
      },
      gallery: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
      ],
    };
    
    res.json({ hotel: hotelInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch hotel information' });
  }
};

// Get all services
export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isAvailable: true },
    });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Book airport shuttle
export const bookAirportShuttle = async (req, res) => {
  try {
    const { bookingId, flightNumber, arrivalTime, passengerCount } = req.body;
    
    const booking = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        needsAirportShuttle: true,
        flightNumber,
        specialRequest: `Airport shuttle requested. Flight: ${flightNumber}, Arrival: ${arrivalTime}, Passengers: ${passengerCount}`,
      },
    });
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book airport shuttle' });
  }
};

// Create review
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    const review = await prisma.review.create({
      data: {
        userId,
        rating,
        comment,
      },
      include: { user: true },
    });
    
    res.status(201).json({ review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    res.json({ reviews, averageRating, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get events
export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
    });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};