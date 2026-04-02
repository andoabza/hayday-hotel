import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { motion } from 'framer-motion';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ type: '', capacity: '', minPrice: '', maxPrice: '' });
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      // Parse JSON strings back to arrays
      const parsedRooms = res.data.rooms.map(room => ({
        ...room,
        images: typeof room.images === 'string' ? JSON.parse(room.images) : room.images,
        amenities: typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities,
      }));
      setRooms(parsedRooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filters.type && room.type !== filters.type) return false;
    if (filters.capacity && room.capacity < parseInt(filters.capacity)) return false;
    if (filters.minPrice && room.basePrice < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && room.basePrice > parseInt(filters.maxPrice)) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Our Rooms</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8 flex flex-wrap gap-4 justify-center">
        <select onChange={e => setFilters({ ...filters, type: e.target.value })} className="border p-2 rounded">
          <option value="">All Types</option>
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
        </select>
        <select onChange={e => setFilters({ ...filters, capacity: e.target.value })} className="border p-2 rounded">
          <option value="">Capacity</option>
          <option value="1">1+ Guests</option>
          <option value="2">2+ Guests</option>
          <option value="4">4+ Guests</option>
        </select>
        <input 
          type="number" 
          placeholder="Min Price (ETB)" 
          onChange={e => setFilters({ ...filters, minPrice: e.target.value })} 
          className="border p-2 rounded" 
        />
        <input 
          type="number" 
          placeholder="Max Price (ETB)" 
          onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} 
          className="border p-2 rounded" 
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((room, idx) => (
          <motion.div 
            key={room.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }} 
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
          >
            <img 
              src={room.images?.[0] || 'https://via.placeholder.com/400x300'} 
              alt={room.name} 
              className="w-full h-64 object-cover" 
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
              <p className="text-gray-600 mb-2">{room.type} • Up to {room.capacity} guests</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities?.slice(0, 3).map((amenity, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {amenity}
                  </span>
                ))}
                {room.hasKitchen && (
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded">
                    Kitchen
                  </span>
                )}
                {room.hasBalcony && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                    Balcony
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-4">{room.description?.substring(0, 100)}...</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-amber-700">
                  {formatPrice(room.basePrice)}
                  <span className="text-sm font-normal">/night</span>
                </span>
                <Link to={`/rooms/${room.id}`} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;