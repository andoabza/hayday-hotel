import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wifi, Coffee, SquareParking, Plane, Utensils, Wine, Heart, Dumbbell, Waves } from 'lucide-react';

const Home = () => {
  const highlights = [
    { icon: Wifi, name: 'Free Wi-Fi', description: 'High-speed internet throughout' },
    { icon: Coffee, name: 'Free Breakfast', description: 'Complimentary daily breakfast' },
    { icon: SquareParking, name: 'Free Parking', description: 'Secure on-site parking' },
    { icon: Plane, name: 'Airport Shuttle', description: '24/7 airport transfers' },
    { icon: Utensils, name: 'Restaurant', description: 'Traditional & international cuisine' },
    { icon: Wine, name: 'Two Bars', description: 'Signature cocktails & drinks' },
    { icon: Heart, name: 'Spa', description: 'Full-service wellness center' },
    { icon: Dumbbell, name: 'Fitness Center', description: 'Modern gym equipment' },
    { icon: Waves, name: 'Outdoor Pool', description: 'Seasonal swimming pool' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[80vh] bg-cover bg-center" style={{ backgroundImage: "url('/image.jpg')" }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-white text-center px-4">
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl font-bold mb-4">
            Welcome to Hayday Hotel
          </motion.h1>
          <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-xl md:text-2xl mb-8">
            Luxury & Comfort in the Heart of Addis Ababa
          </motion.p>
          <div className="flex gap-4">
            <Link to="/rooms" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition">
              Book Now
            </Link>
            <Link to="/hotel" className="bg-white hover:bg-gray-100 text-amber-600 px-8 py-3 rounded-lg text-lg font-semibold transition">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Location Info */}
      <section className="py-8 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <p className="text-gray-700">✈️ 7 km from Bole International Airport</p>
            </div>
            <div className="p-4">
              <p className="text-gray-700">🏛️ 10 km from National Museum of Ethiopia</p>
            </div>
            <div className="p-4">
              <p className="text-gray-700">🛍️ 11 km from Merkato Express Market</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Hotel Highlights</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="text-center p-4 hover:shadow-lg rounded-lg transition"
                >
                  <Icon className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🛏️</div>
              <h3 className="text-xl font-semibold">Luxurious Rooms</h3>
              <p className="text-gray-600 mt-2">Spacious rooms with balconies, minibars, and coffee makers</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold">Ethiopian Coffee Ceremony</h3>
              <p className="text-gray-600 mt-2">Traditional coffee ceremony experience daily</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold">Event Space</h3>
              <p className="text-gray-600 mt-2">Conference halls and banquet rooms for special occasions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Find Us</h2>
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
            <iframe
              title="Hayday Hotel Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3941.151964171763!2d38.7700331!3d8.9581416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b83a6a90867b1%3A0xe8c0ba915f283299!2sHeyday%20Hotel%20%7C%20Saris%20Addisu%20Sefer%20%7C!5e0!3m2!1sen!2sus!4v1775044651583!5m2!1sen!2sus" 
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;