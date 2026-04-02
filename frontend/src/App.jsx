import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import BookingPage from './pages/BookingPage';
import HotelInfo from './pages/HotelInfo';
import HotelPolicies from './pages/HotelPolicies';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Admin imports
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOffers from './pages/admin/AdminOffers';
import AddRoom from './pages/admin/AddRoom';
import EditRoom from './pages/admin/EditRoom';

// Role-based wrapper component
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/hotel" element={<HotelInfo />} />
          <Route path="/hotel/policies" element={<HotelPolicies />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes (Customer only) */}
          <Route
            path="/dashboard"
            element={
              <RoleBasedRoute allowedRoles={['CUSTOMER']}>
                <UserDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleBasedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <Profile />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/booking/:roomId"
            element={
              <RoleBasedRoute allowedRoles={['CUSTOMER']}>
                <BookingPage />
              </RoleBasedRoute>
            }
          />
          
          {/* Admin Routes (Admin only) */}
          <Route
            path="/admin"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AdminRooms />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/rooms/add"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AddRoom />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AdminBookings />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/offers"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AdminOffers />
              </RoleBasedRoute>
            }
          />
        <Route
  path="/admin/rooms/edit/:id"
  element={
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <EditRoom />
    </RoleBasedRoute>
  }
/>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;