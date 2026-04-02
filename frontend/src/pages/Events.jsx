import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await api.get('/hotel/events');
    setEvents(res.data.events);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Upcoming Events</h1>
      <p className="text-center text-gray-600 mb-12">Join us for these special occasions at Hayday Hotel</p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <img src={event.images[0] || 'https://via.placeholder.com/400x200'} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Capacity: {event.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Price: {event.price} ETB</span>
                </div>
              </div>
              <button className="mt-4 w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition">
                Book Event
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;