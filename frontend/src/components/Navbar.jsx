import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { User, LayoutDashboard, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo with proper image tag */}
        <Link to="/" className="flex items-center">
          <img 
            src="https://heydayhotelethiopia.com/wp-content/themes/dguesthouse/assets/images/xHeyday_Hotel_,P20Addis_Ababa.png.pagespeed.ic.UyiEk11g04.webp" 
            alt="Hayday Hotel Logo" 
            className="h-12 w-auto object-contain"
          />
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/hotel" className="hover:text-amber-600 transition">
            Hotel
          </Link>
          <Link to="/hotel/policies" className="hover:text-amber-600 transition flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Policies
          </Link>
          <Link to="/rooms" className="hover:text-amber-600 transition">
            Rooms
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 hover:text-amber-600 transition">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-2 hover:text-amber-600 transition">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="hover:text-amber-600">
                  Admin
                </Link>
              )}
              <button 
                onClick={logout} 
                className="bg-amber-600 text-white px-4 py-1 rounded hover:bg-amber-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-amber-600 transition">
                Login
              </Link>
              <Link to="/register" className="bg-amber-600 text-white px-4 py-1 rounded hover:bg-amber-700 transition">
                Register
              </Link>
            </>
          )}
          
          <button
            onClick={toggleCurrency}
            className="px-3 py-1 border rounded-md text-sm font-medium hover:bg-gray-50 transition"
          >
            {currency}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;