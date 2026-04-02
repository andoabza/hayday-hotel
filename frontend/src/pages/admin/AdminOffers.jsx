import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', discountPercent: 0, startDate: '', endDate: '' });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const res = await api.get('/admin/offers');
    setOffers(res.data.offers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/admin/offers', form);
    setForm({ title: '', description: '', discountPercent: 0, startDate: '', endDate: '' });
    fetchOffers();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this offer?')) {
      await api.delete(`/admin/offers/${id}`);
      fetchOffers();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Manage Offers</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Offer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border p-2 rounded" required />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border p-2 rounded" rows="3" />
            <input type="number" placeholder="Discount %" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: parseFloat(e.target.value) })} className="w-full border p-2 rounded" required />
            <input type="date" placeholder="Start Date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full border p-2 rounded" required />
            <input type="date" placeholder="End Date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full border p-2 rounded" required />
            <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded">Create Offer</button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Existing Offers</h2>
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{offer.title}</h3>
                  <p className="text-sm text-gray-600">{offer.discountPercent}% off | {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDelete(offer.id)} className="text-red-600">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOffers;