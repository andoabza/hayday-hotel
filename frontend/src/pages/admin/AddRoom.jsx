import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Plus, Trash2, Upload, X, Check, 
  Home, Bed, Users, DollarSign, 
  Wifi, Car, Coffee, Utensils, 
  Wind, Tv, Bath, Dumbbell,
  Image, Eye, Edit, Save, ArrowLeft,
  Camera, Grid, List, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const fileInputRef = useRef(null);
  
  const [room, setRoom] = useState({
    // Basic Info
    name: '',
    type: 'Standard',
    roomNumber: '',
    floor: 1,
    size: 25,
    capacity: 2,
    bedType: 'Queen',
    view: 'City View',
    
    // Pricing
    basePrice: 0,
    minStay: 1,
    maxStay: 30,
    
    // Features
    hasKitchen: false,
    hasBalcony: true,
    breakfastIncluded: false,
    parkingAvailable: true,
    wifiSpeed: '100 Mbps',
    
    // Amenities
    amenities: [],
    
    // Policies
    cancellationPolicy: 'Free cancellation 48 hours before check-in',
    depositRequired: false,
    
    // Description
    description: '',
    
    // Media
    images: []
  });
  
  const [newAmenity, setNewAmenity] = useState('');
  
  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'];
  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin'];
  const views = ['City View', 'Pool View', 'Garden View', 'Mountain View', 'Ocean View'];
  
  const availableAmenities = [
    { name: 'Wi-Fi', icon: Wifi, category: 'Tech' },
    { name: 'Air Conditioning', icon: Wind, category: 'Comfort' },
    { name: 'Flat-screen TV', icon: Tv, category: 'Entertainment' },
    { name: 'Minibar', icon: Coffee, category: 'Dining' },
    { name: 'Coffee Maker', icon: Coffee, category: 'Dining' },
    { name: 'Bathrobe', icon: Bath, category: 'Bathroom' },
    { name: 'Hair Dryer', icon: Wind, category: 'Bathroom' },
    { name: 'Iron', icon: Home, category: 'Convenience' },
    { name: 'Safe', icon: Home, category: 'Security' },
    { name: 'Work Desk', icon: Home, category: 'Business' },
    { name: 'Room Service', icon: Utensils, category: 'Service' },
    { name: 'Gym Access', icon: Dumbbell, category: 'Wellness' }
  ];
  
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
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleImageDelete = (indexToDelete) => {
    setRoom(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToDelete)
    }));
    if (previewImage === indexToDelete) setPreviewImage(null);
  };
  
  const handleImageReorder = (fromIndex, toIndex) => {
    const newImages = [...room.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setRoom(prev => ({ ...prev, images: newImages }));
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
  
  const toggleAmenity = (amenity) => {
    if (room.amenities.includes(amenity)) {
      removeAmenity(amenity);
    } else {
      setRoom(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/admin/rooms', room);
      navigate('/admin/rooms');
    } catch (error) {
      console.error('Failed to create room:', error);
      alert(error.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };
  
  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return room.name && room.basePrice > 0 && room.description;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with Back Button */}
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
              <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
              <p className="text-gray-600 mt-1">Create a beautiful room listing with images and details</p>
            </div>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Basic Info', icon: Home },
              { step: 2, label: 'Features & Images', icon: Image },
              { step: 3, label: 'Amenities', icon: Star },
              { step: 4, label: 'Policies', icon: Shield }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentStep >= item.step;
              const isCurrent = currentStep === item.step;
              
              return (
                <div key={item.step} className="flex items-center flex-1">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-amber-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-500'
                    } ${isCurrent ? 'ring-4 ring-amber-200' : ''}`}>
                      {isActive && currentStep > item.step ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                  {item.step < 4 && (
                    <div className={`flex-1 h-1 mx-4 transition ${
                      currentStep > item.step ? 'bg-amber-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-gray-600 mt-1">Tell guests about your room</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => setRoom({ ...room, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="e.g., Deluxe Ocean View Suite"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Type *
                    </label>
                    <select
                      value={room.type}
                      onChange={(e) => setRoom({ ...room, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      value={room.roomNumber}
                      onChange={(e) => setRoom({ ...room, roomNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g., 101"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor
                    </label>
                    <input
                      type="number"
                      value={room.floor}
                      onChange={(e) => setRoom({ ...room, floor: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Size (m²)
                    </label>
                    <input
                      type="number"
                      value={room.size}
                      onChange={(e) => setRoom({ ...room, size: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <select
                      value={room.capacity}
                      onChange={(e) => setRoom({ ...room, capacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map(cap => (
                        <option key={cap} value={cap}>{cap} {cap === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bed Type
                    </label>
                    <select
                      value={room.bedType}
                      onChange={(e) => setRoom({ ...room, bedType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {bedTypes.map(bed => (
                        <option key={bed} value={bed}>{bed}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      View
                    </label>
                    <select
                      value={room.view}
                      onChange={(e) => setRoom({ ...room, view: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {views.map(view => (
                        <option key={view} value={view}>{view}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (per night) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={room.basePrice}
                      onChange={(e) => setRoom({ ...room, basePrice: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={room.description}
                    onChange={(e) => setRoom({ ...room, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Describe the room, its features, and what makes it special..."
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Step 2: Features & Images */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Features Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                  <h2 className="text-2xl font-bold text-gray-900">Room Features</h2>
                  <p className="text-gray-600 mt-1">Select what makes this room special</p>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Stay (nights)
                      </label>
                      <input
                        type="number"
                        value={room.minStay}
                        onChange={(e) => setRoom({ ...room, minStay: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Stay (nights)
                      </label>
                      <input
                        type="number"
                        value={room.maxStay}
                        onChange={(e) => setRoom({ ...room, maxStay: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wi-Fi Speed
                    </label>
                    <input
                      type="text"
                      value={room.wifiSpeed}
                      onChange={(e) => setRoom({ ...room, wifiSpeed: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g., 100 Mbps"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Room Features</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={room.hasKitchen}
                          onChange={(e) => setRoom({ ...room, hasKitchen: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        <span className="text-sm">Kitchen/Kitchenette</span>
                      </label>
                      
                      <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={room.hasBalcony}
                          onChange={(e) => setRoom({ ...room, hasBalcony: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        <span className="text-sm">Private Balcony</span>
                      </label>
                      
                      <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={room.breakfastIncluded}
                          onChange={(e) => setRoom({ ...room, breakfastIncluded: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        <span className="text-sm">Breakfast Included</span>
                      </label>
                      
                      <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={room.parkingAvailable}
                          onChange={(e) => setRoom({ ...room, parkingAvailable: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        <span className="text-sm">Parking Available</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image Upload Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Room Images</h2>
                      <p className="text-gray-600 mt-1">Upload beautiful photos of your room</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100'}`}
                      >
                        <Grid className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100'}`}
                      >
                        <List className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  {/* Upload Area */}
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amber-400 transition cursor-pointer"
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                        <p className="text-gray-600">Uploading images...</p>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click or drag and drop to upload images</p>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                  
                  {/* Image Gallery */}
                  {room.images.length > 0 && (
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Uploaded Images ({room.images.length})</h3>
                        <p className="text-sm text-gray-500">Drag to reorder</p>
                      </div>
                      
                      <div className={`grid gap-4 ${
                        viewMode === 'grid' 
                          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                          : 'grid-cols-1'
                      }`}>
                        {room.images.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative group ${
                              viewMode === 'list' ? 'flex items-center gap-4' : ''
                            }`}
                          >
                            <div className={`relative overflow-hidden rounded-lg ${
                              viewMode === 'list' ? 'w-32 h-24' : 'aspect-video'
                            }`}>
                              <img
                                src={image}
                                alt={`Room ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(index)}
                                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleImageDelete(index)}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            {viewMode === 'list' && (
                              <div className="flex-1">
                                <p className="font-medium">Image {index + 1}</p>
                                <p className="text-sm text-gray-500 truncate">{image}</p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Step 3: Amenities */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-2xl font-bold text-gray-900">Room Amenities</h2>
                <p className="text-gray-600 mt-1">Select amenities available in this room</p>
              </div>
              
              <div className="p-8 space-y-6">
                {/* Custom Amenity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Custom Amenity
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g., Ocean View"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Selected Amenities */}
                {room.amenities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
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
                )}
                
                {/* Suggested Amenities */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableAmenities.map((amenity, index) => {
                      const Icon = amenity.icon;
                      const isSelected = room.amenities.includes(amenity.name);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleAmenity(amenity.name)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{amenity.name}</span>
                          {isSelected && <Check className="h-3 w-3 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Step 4: Policies */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-2xl font-bold text-gray-900">Room Policies</h2>
                <p className="text-gray-600 mt-1">Set cancellation and booking policies</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <select
                    value={room.cancellationPolicy}
                    onChange={(e) => setRoom({ ...room, cancellationPolicy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>Free cancellation 48 hours before check-in</option>
                    <option>Free cancellation 24 hours before check-in</option>
                    <option>Non-refundable</option>
                    <option>Flexible (free cancellation up to check-in)</option>
                  </select>
                </div>
                
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={room.depositRequired}
                    onChange={(e) => setRoom({ ...room, depositRequired: e.target.checked })}
                    className="rounded text-amber-600 w-5 h-5"
                  />
                  <div>
                    <span className="font-medium">Require deposit for booking</span>
                    <p className="text-sm text-gray-500">First night deposit required at time of booking</p>
                  </div>
                </label>
                
                <div className="bg-amber-50 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Important Note</p>
                    <p className="text-sm text-amber-700 mt-1">
                      These policies will be shown to guests during the booking process.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="ml-auto px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Create Room
                  </>
                )}
              </button>
            )}
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
              className="relative max-w-5xl w-full"
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
                <X className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <button
                  onClick={() => setPreviewImage(Math.max(0, previewImage - 1))}
                  disabled={previewImage === 0}
                  className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 disabled:opacity-30"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="px-3 py-1 bg-black bg-opacity-50 rounded-full text-white text-sm">
                  {previewImage + 1} / {room.images.length}
                </span>
                <button
                  onClick={() => setPreviewImage(Math.min(room.images.length - 1, previewImage + 1))}
                  disabled={previewImage === room.images.length - 1}
                  className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 disabled:opacity-30"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddRoom;