import axios from 'axios';
import NodeGeocoder from 'node-geocoder';
import { prisma } from '../../index.js';

export class IntegrationsService {
  constructor() {
    this.geocoder = NodeGeocoder({
      provider: 'google',
      apiKey: process.env.GOOGLE_MAPS_API_KEY
    });
    
    this.weatherAPI = process.env.WEATHER_API_KEY;
    this.expediaAPI = process.env.EXPEDIA_API_KEY;
    this.bookingAPI = process.env.BOOKING_API_KEY;
  }

  async getWeatherRecommendations(city = 'Addis Ababa') {
    try {
      const response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${this.weatherAPI}&q=${city}&days=7`
      );
      
      const weather = response.data;
      
      return {
        current: {
          temp: weather.current.temp_c,
          condition: weather.current.condition.text,
          icon: weather.current.condition.icon
        },
        forecast: weather.forecast.forecastday.map(day => ({
          date: day.date,
          maxTemp: day.day.maxtemp_c,
          minTemp: day.day.mintemp_c,
          condition: day.day.condition.text,
          recommendation: this.getActivityRecommendation(day.day.condition.text)
        }))
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  }

  getActivityRecommendation(weather) {
    const recommendations = {
      Sunny: 'Perfect for outdoor activities, visit the Entoto Mountains',
      Rainy: 'Enjoy our indoor spa and traditional coffee ceremony',
      Cloudy: 'Great day for city tours and museum visits',
      Clear: 'Ideal for rooftop dining and evening walks'
    };
    
    for (const [key, value] of Object.entries(recommendations)) {
      if (weather.includes(key)) return value;
    }
    return 'Enjoy your stay at Hayday Hotel';
  }

  async searchFlights(departure, arrival, date, passengers) {
    try {
      const response = await axios.get('https://api.skyscanner.net/apiservices/browsequotes/v1.0', {
        params: {
          originPlace: departure,
          destinationPlace: arrival,
          outboundDate: date,
          adults: passengers,
          apiKey: process.env.SKYSCANNER_API_KEY
        }
      });
      
      return response.data.Quotes.map(quote => ({
        airline: quote.OutboundLeg.CarrierIds[0],
        price: quote.MinPrice,
        departureTime: quote.OutboundLeg.DepartureDate,
        returnTime: quote.InboundLeg?.DepartureDate
      }));
    } catch (error) {
      console.error('Flight search error:', error);
      return [];
    }
  }

  async searchCarRentals(location, pickupDate, returnDate) {
    try {
      const response = await axios.get('https://api.rentalcars.com/v1/vehicles', {
        params: {
          pickupLocation: location,
          pickupDateTime: pickupDate,
          returnDateTime: returnDate,
          apiKey: process.env.RENTALCARS_API_KEY
        }
      });
      
      return response.data.vehicles.map(vehicle => ({
        name: vehicle.name,
        type: vehicle.type,
        price: vehicle.price.amount,
        currency: vehicle.price.currency,
        image: vehicle.imageUrl
      }));
    } catch (error) {
      console.error('Car rental error:', error);
      return [];
    }
  }

  async syncWithExpedia() {
    try {
      const rooms = await prisma.room.findMany();
      const bookings = await prisma.booking.findMany({
        where: { status: 'CONFIRMED' },
        include: { room: true }
      });
      
      const expediaData = {
        propertyId: process.env.EXPEDIA_PROPERTY_ID,
        rooms: rooms.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type,
          capacity: room.capacity,
          price: room.basePrice
        })),
        availability: bookings.map(booking => ({
          roomId: booking.roomId,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        }))
      };
      
      await axios.post('https://api.expedia.com/partner/v1/availability', expediaData, {
        headers: { Authorization: `Bearer ${this.expediaAPI}` }
      });
      
      console.log('Expedia sync completed');
    } catch (error) {
      console.error('Expedia sync error:', error);
    }
  }

  async translateText(text, targetLang) {
    try {
      const response = await axios.post(
        'https://translation.googleapis.com/language/translate/v2',
        {
          q: text,
          target: targetLang,
          key: process.env.GOOGLE_TRANSLATE_API_KEY
        }
      );
      
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }
}

export const integrations = new IntegrationsService();