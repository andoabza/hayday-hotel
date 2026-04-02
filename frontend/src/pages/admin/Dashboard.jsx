import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCurrency } from '../../contexts/CurrencyContext';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, occupancyRate: 0, activeBookings: 0 });
  const { formatPrice } = useCurrency();

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data));
  }, []);

  const occupancyData = [{ name: 'Occupied', value: stats.occupancyRate }, { name: 'Available', value: 100 - stats.occupancyRate }];
  const COLORS = ['#d97706', '#e5e7eb'];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm">Total Bookings</h3>
          <p className="text-3xl font-bold">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm">Revenue</h3>
          <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm">Occupancy Rate</h3>
          <p className="text-3xl font-bold">{stats.occupancyRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-gray-500 text-sm">Active Bookings</h3>
          <p className="text-3xl font-bold">{stats.activeBookings}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Occupancy</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={occupancyData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {occupancyData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend (Mock)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ month: 'Jan', revenue: 12000 }, { month: 'Feb', revenue: 15000 }, { month: 'Mar', revenue: 18000 }]}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;