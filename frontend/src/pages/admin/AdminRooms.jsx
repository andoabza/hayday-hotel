import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ name: '', type: '', capacity: 1, basePrice: 0, description: '', images: [] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const res = await api.get('/admin/rooms');
    setRooms(res.data.rooms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/admin/rooms/${editingId}`, form);
    } else {
      await api.post('/admin/rooms', form);
    }
    setForm({ name: '', type: '', capacity: 1, basePrice: 0, description: '', images: [] });
    setEditingId(null);
    fetchRooms();
  };

  const handleEdit = (room) => {
    setForm(room);
    setEditingId(room.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this room?')) {
      await api.delete(`/admin/rooms/${id}`);
      fetchRooms();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData);
    setForm({ ...form, images: [...form.images, res.data.url] });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Manage Rooms</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Room' : 'Add New Room'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border p-2 rounded" required />
            <input type="number" placeholder="Capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} className="w-full border p-2 rounded" required />
            <input type="number" placeholder="Base Price (ETB)" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: parseFloat(e.target.value) })} className="w-full border p-2 rounded" required />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border p-2 rounded" rows="3" />
            <div>
              <label className="block mb-1">Images</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
              {form.images.map((url, idx) => (
                <div key={idx} className="text-sm text-gray-600">{url}</div>
              ))}
            </div>
            <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', type: '', capacity: 1, basePrice: 0, description: '', images: [] }); }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>}
          </form>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Existing Rooms</h2>
          <div className="space-y-4">
            {rooms.map(room => (
              <div key={room.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{room.name}</h3>
                  <p className="text-sm text-gray-600">{room.type} | {room.capacity} guests | {room.basePrice} ETB/night</p>
                </div>
                <div>
                  {/* <button onClick={() => handleEdit(room)} className="text-blue-600 mr-2">Edit</button> */}
                  <button
  onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}
  className="text-amber-600 hover:text-amber-900"
  title="Edit Room"
>
  <Edit className="h-4 w-4" />
</button>
                  <button onClick={() => handleDelete(room.id)} className="text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRooms;