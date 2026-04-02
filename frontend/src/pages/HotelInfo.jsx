import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, Coffee, SquareParking, Wind, Home, Users, 
  Plane, Scissors, Bell, Dumbbell, Waves, 
  Utensils, Wine, Briefcase, Calendar, 
  Shield, CreditCard, Phone, Mail, MapPin,
  Star, ShoppingBag, Clock, Heart, CheckCircle,
  Dog
} from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const HotelInfo = () => {
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [activeTab, setActiveTab] = useState('amenities');

  useEffect(() => {
    fetchHotelInfo();
    fetchReviews();
  }, []);

  const fetchHotelInfo = async () => {
    const res = await api.get('/hotel/info');
    setHotel(res.data.hotel);
  };

  const fetchReviews = async () => {
    const res = await api.get('/hotel/reviews');
    setReviews(res.data.reviews);
    setAverageRating(res.data.averageRating);
  };

  if (!hotel) return <div className="text-center py-20">Loading...</div>;

  const iconMap = {
    wifi: Wifi,
    coffee: Coffee,
    parking: SquareParking,
    ac: Wind,
    'coffee-maker': Coffee,
    shuttle: Plane,
    laundry: Scissors,
    'room-service': Bell,
    spa: Heart,
    fitness: Dumbbell,
    pool: Waves,
    restaurant: Utensils,
    bar: Wine,
    business: Briefcase,
    event: Calendar,
    terrace: Home,
    'coffee-ceremony': Coffee,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      {/* ${hotel.gallery[0]} */}
      <div className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: `url('/image2.jpg')` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto h-full flex flex-col justify-end px-4 pb-16 text-white">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            {hotel.name}
          </motion.h1>
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-6 text-lg"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{hotel.location.address}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Description */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">{hotel.description}</p>
          
          {/* Location Details */}
          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Plane className="w-5 h-5 text-amber-600" />
              <span>{hotel.location.distanceToAirport}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span>{hotel.location.distanceToMuseum}</span>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span>{hotel.location.distanceToMarket}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            {['amenities', 'services', 'policies', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-lg font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'text-amber-600 border-b-2 border-amber-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="space-y-8">
              {/* Free Amenities */}
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Free Amenities
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotel.amenities.free.map((amenity, idx) => {
                    const Icon = iconMap[amenity.icon] || Home;
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:shadow-md transition">
                        <Icon className="w-5 h-5 text-amber-600 mt-1" />
                        <div>
                          <p className="font-semibold">{amenity.name}</p>
                          <p className="text-sm text-gray-600">{amenity.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Paid Amenities */}
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                  Paid Services
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotel.amenities.paid.map((amenity, idx) => {
                    const Icon = iconMap[amenity.icon] || Home;
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:shadow-md transition">
                        <Icon className="w-5 h-5 text-amber-600 mt-1" />
                        <div>
                          <p className="font-semibold">{amenity.name}</p>
                          <p className="text-sm text-gray-600">{amenity.description}</p>
                          <p className="text-sm font-medium text-amber-600 mt-1">{amenity.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Facilities</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotel.amenities.facilities.map((facility, idx) => {
                    const Icon = iconMap[facility.icon] || Home;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Icon className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-semibold">{facility.name}</p>
                          <p className="text-sm text-gray-600">{facility.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Available Services</h3>
              <div className="space-y-4">
                {hotel.services.map((service, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold text-lg">{service.name}</p>
                      <p className="text-gray-600 text-sm">Duration: {service.duration}</p>
                      {service.bookingRequired && (
                        <p className="text-amber-600 text-sm">Booking required</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">{service.price}</p>
                      <button className="mt-2 bg-amber-600 text-white px-4 py-1 rounded text-sm hover:bg-amber-700">
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policies Tab */}
{activeTab === 'policies' && (
  <div>
    <h3 className="text-2xl font-bold mb-6">Hotel Policies</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-1" />
          <div>
            <p className="font-semibold">Check-in / Check-out</p>
            <p className="text-gray-600">Check-in: 14:00</p>
            <p className="text-gray-600">Check-out: 12:00</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Dog className="h-5 w-5 text-amber-600 mt-1" />
          <div>
            <p className="font-semibold">Pets</p>
            <p className="text-gray-600">Pets are allowed on request (charges may apply)</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-amber-600 mt-1" />
          <div>
            <p className="font-semibold">Children</p>
            <p className="text-gray-600">Children under 2 stay free, under 12 get 50% off</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-amber-600 mt-1" />
          <div>
            <p className="font-semibold">Cancellation</p>
            <p className="text-gray-600">Free cancellation up to 48 hours before check-in</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-amber-600 mt-1" />
          <div>
            <p className="font-semibold">Payment Methods</p>
            <p className="text-gray-600">Cash, credit cards, and mobile money accepted</p>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-6 text-center">
      <Link 
        to="/hotel/policies" 
        className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
      >
        View All Policies
      </Link>
    </div>
  </div>
)}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Guest Reviews</h3>
                <button className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700">
                  Write a Review
                </button>
              </div>

              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <div key={idx} className="border-b pb-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 font-bold">
                          {review.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{review.user.name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 ml-auto">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
          <iframe
            title="Hayday Hotel Location"
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3941.151964171763!2d38.7700331!3d8.9581416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b83a6a90867b1%3A0xe8c0ba915f283299!2sHeyday%20Hotel%20%7C%20Saris%20Addisu%20Sefer%20%7C!5e0!3m2!1sen!2sus!4v1775044651583!5m2!1sen!2sus" 

            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default HotelInfo;

