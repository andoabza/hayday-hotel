import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCurrency } from '../../contexts/CurrencyContext';
import { 
  TrendingUp, Users, Home, DollarSign, Calendar,
  CheckCircle, XCircle, Clock, AlertCircle,
  BarChart3, Settings, Hotel, Bed,
  CreditCard, Star, Phone, Mail, MapPin,
  Download, Filter, Search, Eye, Edit, Trash2,
  Plus, ChevronRight, MoreVertical, RefreshCw,
  Menu, X, LogOut, Bell, User, Package, 
  ShoppingBag, Truck, MessageSquare, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRooms: 0,
    occupancyRate: 0,
    averageRating: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    occupancyGrowth: 0
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [roomOccupancy, setRoomOccupancy] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchRevenueData();
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, usersRes, occupancyRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/bookings?limit=5'),
        api.get('/admin/users?limit=5'),
        api.get('/admin/room-occupancy')
      ]);
      
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data.bookings);
      setRecentUsers(usersRes.data.users);
      setRoomOccupancy(occupancyRes.data.rooms);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const res = await api.get(`/admin/revenue?period=${selectedPeriod}`);
      setRevenueData(res.data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const occupancyData = roomOccupancy.map(room => ({
    name: room.name,
    occupancy: room.occupancyRate
  }));

  const COLORS = ['#d97706', '#fbbf24', '#f59e0b', '#b45309', '#92400e'];

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: Home, path: '/admin' },
    { id: 'rooms', name: 'Rooms Management', icon: Bed, path: '/admin/rooms' },
    { id: 'bookings', name: 'Bookings', icon: Calendar, path: '/admin/bookings' },
    { id: 'users', name: 'Users', icon: Users, path: '/admin/users' },
    { id: 'offers', name: 'Offers & Promotions', icon: Star, path: '/admin/offers' },
    { id: 'reports', name: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div 
        initial={{ width: 280 }}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-gray-900 text-white flex flex-col shadow-lg"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <motion.div 
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center gap-3"
            >
              <Hotel className="h-8 w-8 text-amber-500" />
              <span className="font-bold text-xl">Hayday Admin</span>
            </motion.div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 transition"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-6 py-3 transition ${
                  isActive 
                    ? 'bg-amber-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">Super Administrator</p>
              </div>
            )}
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {menuItems.find(m => m.id === activeTab)?.name || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20"
                    >
                      <div className="p-3 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-gray-500">No notifications</p>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className="p-3 border-b hover:bg-gray-50">
                              <p className="text-sm">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              <button
                onClick={fetchDashboardData}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
                <span className={`text-sm font-medium ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                </span>
              </div>
              <h3 className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</h3>
              <p className="text-gray-600 text-sm mt-1">Total Revenue</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+{stats.totalBookings}</span>
              </div>
              <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
              <p className="text-gray-600 text-sm mt-1">Total Bookings</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+{stats.totalUsers}</span>
              </div>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              <p className="text-gray-600 text-sm mt-1">Total Users</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <span className={`text-sm font-medium ${stats.occupancyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.occupancyGrowth >= 0 ? '+' : ''}{stats.occupancyGrowth}%
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.occupancyRate}%</h3>
              <p className="text-gray-600 text-sm mt-1">Occupancy Rate</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Room Occupancy Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Room Occupancy</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="occupancy" fill="#d97706" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.pendingBookings}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.cancelledBookings}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.completedBookings}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold">Recent Bookings</h2>
                <button
                  onClick={() => navigate('/admin/bookings')}
                  className="text-amber-600 hover:text-amber-700 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="divide-y">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{booking.user?.name}</p>
                        <p className="text-sm text-gray-500">{booking.room?.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-sm font-semibold text-amber-600 mt-1">
                          {formatPrice(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold">New Users</h2>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-amber-600 hover:text-amber-700 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="divide-y">
                {recentUsers.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-600 font-bold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/admin/rooms/add')}
                className="p-4 border rounded-lg hover:border-amber-500 hover:bg-amber-50 transition group"
              >
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Add Room</p>
              </button>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="p-4 border rounded-lg hover:border-amber-500 hover:bg-amber-50 transition group"
              >
                <Calendar className="h-6 w-6 text-gray-400 group-hover:text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">View Bookings</p>
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="p-4 border rounded-lg hover:border-amber-500 hover:bg-amber-50 transition group"
              >
                <Users className="h-6 w-6 text-gray-400 group-hover:text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Manage Users</p>
              </button>
              <button
                onClick={() => navigate('/admin/offers')}
                className="p-4 border rounded-lg hover:border-amber-500 hover:bg-amber-50 transition group"
              >
                <Star className="h-6 w-6 text-gray-400 group-hover:text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Create Offer</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;