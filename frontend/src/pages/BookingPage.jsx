import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequest, setSpecialRequest] = useState('');
  const [needsAirportShuttle, setNeedsAirportShuttle] = useState(false);
  const [flightNumber, setFlightNumber] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const bookingRes = await api.post('/bookings', {
        roomId: parseInt(roomId),
        checkIn,
        checkOut,
        adults,
        children,
        specialRequest,
        needsAirportShuttle,
        flightNumber: needsAirportShuttle ? flightNumber : null,
      });
      const { booking } = bookingRes.data;

      // If airport shuttle is needed, book it
      if (needsAirportShuttle) {
        await api.post('/hotel/shuttle', {
          bookingId: booking.id,
          flightNumber,
          arrivalTime,
          passengerCount: adults + children,
        });
      }

      const paymentRes = await api.post('/payments/create-intent', { bookingId: booking.id });
      const { clientSecret } = paymentRes.data;

      const stripe = await stripePromise;
      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success`,
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else {
        await api.post('/bookings/confirm', { 
          bookingId: booking.id, 
          paymentIntentId: result.paymentIntent.id 
        });
        navigate('/bookings/success');
      }
    } catch (err) {
      console.error(err);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6">
        <div>
          <label className="block font-medium mb-1">Check-in Date</label>
          <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Check-out Date</label>
          <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Adults</label>
            <input type="number" min="1" value={adults} onChange={(e) => setAdults(parseInt(e.target.value))} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium mb-1">Children</label>
            <input type="number" min="0" value={children} onChange={(e) => setChildren(parseInt(e.target.value))} className="w-full border p-2 rounded" />
          </div>
        </div>
        
        {/* Airport Shuttle Option */}
        <div className="border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={needsAirportShuttle}
              onChange={(e) => setNeedsAirportShuttle(e.target.checked)}
              className="w-4 h-4 text-amber-600"
            />
            <span className="font-medium">Need Airport Shuttle? (+500 ETB)</span>
          </label>
          
          {needsAirportShuttle && (
            <div className="mt-4 space-y-4 pl-6">
              <div>
                <label className="block font-medium mb-1">Flight Number</label>
                <input 
                  type="text" 
                  required={needsAirportShuttle}
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="e.g., ET 123"
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Arrival Time</label>
                <input 
                  type="datetime-local" 
                  required={needsAirportShuttle}
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block font-medium mb-1">Special Requests (optional)</label>
          <textarea rows={3} value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;