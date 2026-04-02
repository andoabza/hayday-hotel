import { gql } from 'graphql-tools';

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    role: String!
    bookings: [Booking!]
    reviews: [Review!]
    customerLifetimeValue: Float
  }
  
  type Room {
    id: ID!
    name: String!
    type: String!
    capacity: Int!
    basePrice: Float!
    description: String
    images: [String!]
    amenities: [String!]
    availability: [Availability!]!
  }
  
  type Availability {
    date: String!
    available: Boolean!
    price: Float!
    minStay: Int!
  }
  
  type Booking {
    id: ID!
    user: User!
    room: Room!
    checkIn: String!
    checkOut: String!
    adults: Int!
    children: Int!
    status: String!
    totalPrice: Float!
  }
  
  type Review {
    id: ID!
    user: User!
    rating: Int!
    comment: String
    createdAt: String!
  }
  
  type RevenueForecast {
    date: String!
    predictedRevenue: Float!
    confidence: Float!
  }
  
  type HeatMapData {
    date: String!
    roomId: ID!
    roomName: String!
    bookings: Int!
    intensity: Float!
  }
  
  type Query {
    users: [User!]!
    user(id: ID!): User
    rooms: [Room!]!
    room(id: ID!): Room
    bookings: [Booking!]!
    booking(id: ID!): Booking
    availability(roomId: ID!, startDate: String!, endDate: String!): [Availability!]!
    revenueForecast(days: Int!): [RevenueForecast!]!
    heatMap(startDate: String!, endDate: String!): [HeatMapData!]!
  }
  
  type Mutation {
    createBooking(
      roomId: ID!,
      checkIn: String!,
      checkOut: String!,
      adults: Int!,
      children: Int!
    ): Booking!
    
    cancelBooking(id: ID!): Booking!
    
    updateProfile(
      name: String,
      email: String,
      phone: String
    ): User!
    
    changePassword(
      currentPassword: String!,
      newPassword: String!
    ): Boolean!
  }
`;

export const resolvers = {
  Query: {
    users: async (_, __, { prisma }) => {
      return await prisma.user.findMany();
    },
    user: async (_, { id }, { prisma }) => {
      return await prisma.user.findUnique({ where: { id: parseInt(id) } });
    },
    rooms: async (_, __, { prisma }) => {
      return await prisma.room.findMany();
    },
    room: async (_, { id }, { prisma }) => {
      return await prisma.room.findUnique({ where: { id: parseInt(id) } });
    },
    availability: async (_, { roomId, startDate, endDate }, { pricingEngine }) => {
      return await pricingEngine.getAvailabilityCalendar(
        parseInt(roomId),
        new Date(startDate),
        new Date(endDate)
      );
    },
    revenueForecast: async (_, { days }, { mlAnalytics }) => {
      return await mlAnalytics.forecastRevenue(days);
    },
    heatMap: async (_, { startDate, endDate }, { mlAnalytics }) => {
      return await mlAnalytics.getHeatMapData(new Date(startDate), new Date(endDate));
    }
  },
  
  Mutation: {
    createBooking: async (_, args, { prisma, pricingEngine, user }) => {
      if (!user) throw new Error('Authentication required');
      
      const totalPrice = await pricingEngine.calculateTotalPrice(
        parseInt(args.roomId),
        new Date(args.checkIn),
        new Date(args.checkOut),
        args.adults,
        args.children,
        user.id
      );
      
      return await prisma.booking.create({
        data: {
          userId: user.id,
          roomId: parseInt(args.roomId),
          checkIn: new Date(args.checkIn),
          checkOut: new Date(args.checkOut),
          adults: args.adults,
          children: args.children,
          totalPrice,
          status: 'PENDING'
        }
      });
    },
    
    cancelBooking: async (_, { id }, { prisma, user }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (booking.userId !== user.id && user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      
      return await prisma.booking.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELLED' }
      });
    }
  }
};