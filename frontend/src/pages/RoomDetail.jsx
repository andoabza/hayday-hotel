import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { Wifi, Coffee, Wind, Tv, Home, Utensils, Bath, Dumbbell } from 'lucide-react';

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const res = await api.get(`/rooms/${id}`);
      const roomData = {
        ...res.data.room,
        images: typeof res.data.room.images === 'string' ? JSON.parse(res.data.room.images) : res.data.room.images,
        amenities: typeof res.data.room.amenities === 'string' ? JSON.parse(res.data.room.amenities) : res.data.room.amenities,
      };
      setRoom(roomData);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    }
  };

  if (!room) return <div className="text-center py-20">Loading...</div>;

  const amenityIcons = {
    'Wi-Fi': Wifi,
    'Coffee Maker': Coffee,
    'Air Conditioning': Wind,
    'Flat-screen TV': Tv,
    'Kitchenette': Home,
    'Bathrobes': Bath,
    'Jacuzzi': Bath,
    'Living Area': Home,
    'Free Breakfast': Utensils,
    'Minibar': Coffee,
    'Seating Area': Home,
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <img 
            src={room.images?.[0] || 'https://via.placeholder.com/600x400'} 
            alt={room.name} 
            className="w-full rounded-lg shadow-lg h-96 object-cover"
          />
          {room.images?.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {room.images.slice(1, 4).map((img, idx) => (
                <img key={idx} src={img} alt={`${room.name} view ${idx + 2}`} className="w-full h-24 object-cover rounded-lg" />
              ))}
            </div>
          )}
        </div>

        {/* Room Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{room.name}</h1>
          <p className="text-gray-600 mb-2">{room.type} | Capacity: {room.capacity} guests</p>
          <p className="text-2xl font-bold text-amber-700 mb-4">
            {formatPrice(room.basePrice)} <span className="text-base">/ night</span>
          </p>
          
          {/* Amenities */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {room.amenities?.map((amenity, idx) => {
                const Icon = amenityIcons[amenity] || Utensils;
                return (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <Icon className="w-4 h-4 text-amber-600" />
                    <span>{amenity}</span>
                  </div>
                );
              })}
              {room.hasKitchen && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Home className="w-4 h-4 text-amber-600" />
                  <span>Kitchen</span>
                </div>
              )}
              {room.hasBalcony && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Home className="w-4 h-4 text-amber-600" />
                  <span>Private Balcony</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">{room.description}</p>

          {/* Booking Button */}
          <Link 
            to={user ? `/booking/${room.id}` : '/login'} 
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-amber-700 transition w-full text-center"
          >
            {user ? 'Book Now' : 'Login to Book'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;