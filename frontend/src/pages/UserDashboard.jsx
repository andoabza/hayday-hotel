import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  Calendar, Home, CreditCard, Clock, Users, 
  Star, ChevronRight, X, AlertCircle, 
  Download, Search, Filter, Eye, User, 
  LogOut, Bell, Settings, Heart, Gift,
  Coffee, Wifi, Car, Utensils, Wine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    loyaltyPoints: 0,
    tier: 'Bronze'
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/me');
      setBookings(res.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/user/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await api.patch(`/bookings/${selectedBooking.id}/cancel`);
      await fetchBookings();
      await fetchStats();
      setShowCancelModal(false);
      alert('Booking cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleSubmitReview = async () => {
    try {
      await api.post('/hotel/reviews', reviewData);
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
      alert('Thank you for your review!');
    } catch (error) {
      alert('Failed to submit review');
    }
  };

  const upcomingBookings = bookings.filter(b => 
    b.status === 'CONFIRMED' && new Date(b.checkIn) > new Date()
  );
  
  const activeBookings = bookings.filter(b => 
    b.status === 'CONFIRMED' && new Date(b.checkIn) <= new Date() && new Date(b.checkOut) >= new Date()
  );
  
  const pastBookings = bookings.filter(b => 
    b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.checkOut) < new Date())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
              <p className="text-amber-100">Manage your bookings and preferences</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 transition flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                My Profile
              </button>
              <button
                onClick={() => navigate('/rooms')}
                className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition"
              >
                Book New Stay
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">{stats.totalBookings}</span>
            </div>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</span>
            </div>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.upcomingBookings}</span>
            </div>
            <p className="text-sm text-gray-600">Upcoming Stays</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.loyaltyPoints}</span>
            </div>
            <p className="text-sm text-gray-600">{stats.tier} Points</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'upcoming', label: 'Upcoming Stays', count: upcomingBookings.length },
                { id: 'active', label: 'Active Stays', count: activeBookings.length },
                { id: 'past', label: 'Past Stays', count: pastBookings.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id ? 'bg-amber-100 text-amber-600' : 'bg-gray-100'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="divide-y divide-gray-200">
            {activeTab === 'upcoming' && upcomingBookings.map(booking => (
              <BookingCard 
                key={booking.id}
                booking={booking}
                formatPrice={formatPrice}
                onCancel={() => {
                  setSelectedBooking(booking);
                  setShowCancelModal(true);
                }}
                getStatusColor={getStatusColor}
              />
            ))}
            
            {activeTab === 'active' && activeBookings.map(booking => (
              <BookingCard 
                key={booking.id}
                booking={booking}
                formatPrice={formatPrice}
                getStatusColor={getStatusColor}
                isActive={true}
              />
            ))}
            
            {activeTab === 'past' && pastBookings.map(booking => (
              <BookingCard 
                key={booking.id}
                booking={booking}
                formatPrice={formatPrice}
                getStatusColor={getStatusColor}
                onReview={() => {
                  setSelectedBooking(booking);
                  setShowReviewModal(true);
                }}
              />
            ))}
            
            {activeTab === 'upcoming' && upcomingBookings.length === 0 && (
              <EmptyState message="No upcoming stays" action="Book Now" />
            )}
            {activeTab === 'active' && activeBookings.length === 0 && (
              <EmptyState message="No active stays" action="View Rooms" />
            )}
            {activeTab === 'past' && pastBookings.length === 0 && (
              <EmptyState message="No past stays" action="Book Your First Stay" />
            )}
          </div>
        </div>

        {/* Hotel Amenities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-600" />
            Hotel Amenities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Wifi className="h-5 w-5 text-amber-600" />
              <span className="text-sm">Free Wi-Fi</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Coffee className="h-5 w-5 text-amber-600" />
              <span className="text-sm">Free Breakfast</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Car className="h-5 w-5 text-amber-600" />
              <span className="text-sm">Free Parking</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Utensils className="h-5 w-5 text-amber-600" />
              <span className="text-sm">Restaurant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && selectedBooking && (
          <Modal
            title="Cancel Booking"
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancelBooking}
            confirmText="Yes, Cancel"
            confirmColor="red"
          >
            <p>Are you sure you want to cancel your booking at <strong>{selectedBooking.room?.name}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">
              Check-in: {new Date(selectedBooking.checkIn).toLocaleDateString()}
            </p>
          </Modal>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <Modal
            title="Write a Review"
            onClose={() => setShowReviewModal(false)}
            onConfirm={handleSubmitReview}
            confirmText="Submit Review"
            confirmColor="amber"
          >
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className="focus:outline-none"
                >
                  <Star className={`h-8 w-8 ${
                    star <= reviewData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Share your experience..."
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Booking Card Component
const BookingCard = ({ booking, formatPrice, onCancel, onReview, getStatusColor, isActive }) => (
  <div className="p-6 hover:bg-gray-50 transition">
    <div className="flex flex-col md:flex-row gap-6">
      <img
        src={booking.room?.images?.[0] || 'https://via.placeholder.com/200x150'}
        alt={booking.room?.name}
        className="md:w-48 h-32 object-cover rounded-lg"
      />
      <div className="flex-1">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
          <div>
            <h3 className="text-lg font-semibold">{booking.room?.name}</h3>
            <p className="text-sm text-gray-500">Booking #{booking.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{booking.adults} Adults, {booking.children} Children</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCard className="h-4 w-4" />
            <span className="font-semibold text-amber-600">{formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.open(`/rooms/${booking.roomId}`, '_blank')}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
          >
            View Details <ChevronRight className="h-4 w-4" />
          </button>
          
          {booking.status === 'CONFIRMED' && !isActive && onCancel && (
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Cancel Booking
            </button>
          )}
          
          {booking.status === 'COMPLETED' && onReview && (
            <button
              onClick={onReview}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Write a Review
            </button>
          )}
          
          <button className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1">
            <Download className="h-4 w-4" />
            Invoice
          </button>
        </div>
        
        {isActive && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">You're currently staying with us! Enjoy your stay.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ message, action }) => (
  <div className="text-center py-12">
    <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
    <button
      onClick={() => window.location.href = '/rooms'}
      className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
    >
      {action}
    </button>
  </div>
);

// Modal Component
const Modal = ({ title, children, onClose, onConfirm, confirmText, confirmColor }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-lg shadow-xl max-w-md w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 border-b">
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
      <div className="p-6 border-t flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-2 bg-${confirmColor}-600 text-white rounded-lg hover:bg-${confirmColor}-700`}
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default UserDashboard;