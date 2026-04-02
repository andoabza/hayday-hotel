import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  Save, Trash2, Upload, X, Check, 
  Home, Bed, Users, DollarSign, 
  Wifi, Car, Coffee, Utensils, 
  Wind, Tv, Bath, Dumbbell,
  Image, Eye, Edit, ArrowLeft,
  Camera, AlertCircle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [room, setRoom] = useState({
    name: '',
    type: 'Standard',
    roomNumber: '',
    floor: 1,
    size: 25,
    capacity: 2,
    bedType: 'Queen',
    view: 'City View',
    basePrice: 0,
    minStay: 1,
    maxStay: 30,
    hasKitchen: false,
    hasBalcony: true,
    breakfastIncluded: false,
    parkingAvailable: true,
    wifiSpeed: '100 Mbps',
    amenities: [],
    cancellationPolicy: 'Free cancellation 48 hours before check-in',
    depositRequired: false,
    description: '',
    images: []
  });
  
  const [newAmenity, setNewAmenity] = useState('');
  
  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'];
  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin'];
  const views = ['City View', 'Pool View', 'Garden View', 'Mountain View', 'Ocean View'];
  
  useEffect(() => {
    fetchRoom();
  }, [id]);
  
  const fetchRoom = async () => {
    try {
      const res = await api.get(`/admin/rooms/${id}`);
      const roomData = res.data.room;
      setRoom({
        ...roomData,
        images: typeof roomData.images === 'string' ? JSON.parse(roomData.images) : roomData.images,
        amenities: typeof roomData.amenities === 'string' ? JSON.parse(roomData.amenities) : roomData.amenities
      });
    } catch (error) {
      console.error('Failed to fetch room:', error);
      alert('Failed to load room data');
      navigate('/admin/rooms');
    } finally {
      setFetching(false);
    }
  };
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImages(true);
    const newImages = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const res = await api.post('/upload', formData);
        newImages.push(res.data.url);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setRoom(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    setUploadingImages(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleImageDelete = async (indexToDelete) => {
    setRoom(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToDelete)
    }));
    if (previewImage === indexToDelete) setPreviewImage(null);
  };
  
  const addAmenity = () => {
    if (newAmenity && !room.amenities.includes(newAmenity)) {
      setRoom(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity]
      }));
      setNewAmenity('');
    }
  };
  
  const removeAmenity = (amenity) => {
    setRoom(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put(`/admin/rooms/${id}`, room);
      alert('Room updated successfully!');
      navigate('/admin/rooms');
    } catch (error) {
      console.error('Failed to update room:', error);
      alert(error.response?.data?.error || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/rooms/${id}`);
        alert('Room deleted successfully');
        navigate('/admin/rooms');
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete room');
      }
    }
  };
  
  if (fetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/rooms')}
              className="p-2 hover:bg-gray-200 rounded-lg transition flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Rooms
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Room</h1>
              <p className="text-gray-600 mt-1">Update room information and images</p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-2"
          >
            <Trash2 className="h-5 w-5" />
            Delete Room
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => setRoom({ ...room, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                    <select
                      value={room.type}
                      onChange={(e) => setRoom({ ...room, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                    <input
                      type="text"
                      value={room.roomNumber}
                      onChange={(e) => setRoom({ ...room, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                    <input
                      type="number"
                      value={room.floor}
                      onChange={(e) => setRoom({ ...room, floor: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size (m²)</label>
                    <input
                      type="number"
                      value={room.size}
                      onChange={(e) => setRoom({ ...room, size: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <select
                      value={room.capacity}
                      onChange={(e) => setRoom({ ...room, capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map(cap => (
                        <option key={cap} value={cap}>{cap} {cap === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type</label>
                    <select
                      value={room.bedType}
                      onChange={(e) => setRoom({ ...room, bedType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      {bedTypes.map(bed => (
                        <option key={bed} value={bed}>{bed}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
                    <select
                      value={room.view}
                      onChange={(e) => setRoom({ ...room, view: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      {views.map(view => (
                        <option key={view} value={view}>{view}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (per night) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={room.basePrice}
                      onChange={(e) => setRoom({ ...room, basePrice: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={room.description}
                    onChange={(e) => setRoom({ ...room, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Images */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-xl font-bold text-gray-900">Room Images</h2>
              </div>
              
              <div className="p-6">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadingImages ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mb-3"></div>
                      <p className="text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Click to upload new images</p>
                    </>
                  )}
                </div>
                
                {room.images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Current Images ({room.images.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {room.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Room ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(index)}
                              className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleImageDelete(index)}
                              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Features */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-xl font-bold text-gray-900">Room Features</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={room.hasKitchen}
                      onChange={(e) => setRoom({ ...room, hasKitchen: e.target.checked })}
                      className="rounded text-amber-600"
                    />
                    <span className="text-sm">Kitchen</span>
                  </label>
                  
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={room.hasBalcony}
                      onChange={(e) => setRoom({ ...room, hasBalcony: e.target.checked })}
                      className="rounded text-amber-600"
                    />
                    <span className="text-sm">Balcony</span>
                  </label>
                  
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={room.breakfastIncluded}
                      onChange={(e) => setRoom({ ...room, breakfastIncluded: e.target.checked })}
                      className="rounded text-amber-600"
                    />
                    <span className="text-sm">Breakfast</span>
                  </label>
                  
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={room.parkingAvailable}
                      onChange={(e) => setRoom({ ...room, parkingAvailable: e.target.checked })}
                      className="rounded text-amber-600"
                    />
                    <span className="text-sm">Parking</span>
                  </label>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wi-Fi Speed</label>
                  <input
                    type="text"
                    value={room.wifiSpeed}
                    onChange={(e) => setRoom({ ...room, wifiSpeed: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-xl font-bold text-gray-900">Amenities</h2>
              </div>
              
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Add custom amenity"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="hover:text-amber-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Policies */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-xl font-bold text-gray-900">Policies</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
                  <select
                    value={room.cancellationPolicy}
                    onChange={(e) => setRoom({ ...room, cancellationPolicy: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option>Free cancellation 48 hours before check-in</option>
                    <option>Free cancellation 24 hours before check-in</option>
                    <option>Non-refundable</option>
                    <option>Flexible (free cancellation up to check-in)</option>
                  </select>
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={room.depositRequired}
                    onChange={(e) => setRoom({ ...room, depositRequired: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <span className="text-sm">Require deposit for booking</span>
                </label>
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/rooms')}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={room.images[previewImage]}
                alt="Preview"
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditRoom;