import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Clock, Calendar, Users, Dog, Ban, 
  Car, Wifi, Coffee, CreditCard, 
  Shield, Home, Bell, AlertCircle,
  CheckCircle, XCircle, Info, Phone,
  Mail, MapPin, Star, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

const HotelPolicies = () => {
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/hotel/policies');
      setPolicies(res.data.policies);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    } finally {
      setLoading(false);
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
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hotel Policies</h1>
          <p className="text-xl text-amber-100">Everything you need to know before your stay</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Check-in</p>
            <p className="font-bold text-lg">{policies.checkIn.time}</p>
            <p className="text-xs text-gray-500">From {policies.checkIn.time}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Check-out</p>
            <p className="font-bold text-lg">{policies.checkOut.time}</p>
            <p className="text-xs text-gray-500">Until {policies.checkOut.time}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Cancellation</p>
            <p className="font-bold text-lg">48 Hours</p>
            <p className="text-xs text-gray-500">Free cancellation</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <CreditCard className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Payment</p>
            <p className="font-bold text-lg">Multiple</p>
            <p className="text-xs text-gray-500">Cash & Cards</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Check-in/Check-out Policies */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-amber-600" />
              Check-in & Check-out
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Check-in</h3>
                <p className="text-gray-600 mt-1">Time: {policies.checkIn.time}</p>
                <p className="text-gray-600">{policies.checkIn.instructions}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Requirements:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {policies.checkIn.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-900">Check-out</h3>
                <p className="text-gray-600 mt-1">Time: {policies.checkOut.time}</p>
                <p className="text-gray-600">{policies.checkOut.instructions}</p>
                <p className="text-sm text-amber-600 mt-1">Late check-out fee: {policies.checkOut.lateFee}</p>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-amber-600" />
              Cancellation Policy
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">{policies.cancellation.free}</p>
                  <p className="text-sm text-gray-600">Full refund</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">{policies.cancellation.partial}</p>
                  <p className="text-sm text-gray-600">50% refund</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">{policies.cancellation.full}</p>
                  <p className="text-sm text-gray-600">No refund</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">No-show: {policies.cancellation.noShow}</p>
              </div>
            </div>
          </div>

          {/* Children & Extra Beds */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-amber-600" />
              Children & Extra Beds
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span>Children under 2</span>
                <span className="font-semibold text-green-600">{policies.children.under2}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Children under 12</span>
                <span className="font-semibold text-amber-600">{policies.children.under12}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>Extra bed</span>
                <span className="font-semibold">{policies.children.extraBed}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Crib</span>
                <span className="font-semibold text-green-600">{policies.children.crib}</span>
              </div>
            </div>
          </div>

          {/* Pets Policy */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Dog className="h-6 w-6 text-amber-600" />
              Pets Policy
            </h2>
            {policies.pets.allowed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Pets allowed</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Fee</span>
                  <span className="font-semibold">{policies.pets.fee}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Weight limit</span>
                  <span>{policies.pets.weightLimit}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{policies.pets.restrictions}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <Ban className="h-5 w-5" />
                <span>Pets not allowed</span>
              </div>
            )}
          </div>

          {/* Parking & Wi-Fi */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Car className="h-6 w-6 text-amber-600" />
              Parking & Transportation
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Parking</span>
                  <span className={policies.parking.free ? 'text-green-600' : 'text-amber-600'}>
                    {policies.parking.free ? 'Free' : 'Paid'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{policies.parking.type}</p>
                <p className="text-sm text-gray-500">{policies.parking.spaces}</p>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Wi-Fi</span>
                  <span className="text-green-600">Free</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{policies.wifi.speed}</p>
                <p className="text-sm text-gray-500">{policies.wifi.coverage}</p>
              </div>
            </div>
          </div>

          {/* Breakfast & Dining */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Coffee className="h-6 w-6 text-amber-600" />
              Breakfast & Dining
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Breakfast</span>
                <span className={policies.breakfast.included ? 'text-green-600' : 'text-amber-600'}>
                  {policies.breakfast.included ? 'Included' : `${policies.breakfast.price}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Hours</span>
                <span>{policies.breakfast.hours}</span>
              </div>
              <div>
                <span>Type</span>
                <p className="text-sm text-gray-600 mt-1">{policies.breakfast.type}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-amber-600" />
              Payment Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Accepted Payment Methods</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {policies.payment.accepted.map((method, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">{policies.payment.deposit}</p>
                <p className="text-sm text-gray-500 mt-1">Currency: {policies.payment.currency}</p>
              </div>
            </div>
          </div>

          {/* Housekeeping */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Home className="h-6 w-6 text-amber-600" />
              Housekeeping
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Daily cleaning</span>
                <span>{policies.housekeeping.daily}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Eco option</span>
                <span>{policies.housekeeping.eco}</span>
              </div>
              <div>
                <span>Deep cleaning</span>
                <p className="text-sm text-gray-600 mt-1">{policies.housekeeping.deep}</p>
              </div>
            </div>
          </div>

          {/* Security & Safety */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-600" />
              Security & Safety
            </h2>
            <ul className="space-y-2">
              {policies.security.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Room Amenities */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-600" />
              In-Room Amenities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {policies.amenities.included.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Important Information</h3>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>• {policies.smoking.allowed ? 'Smoking rooms available' : 'Non-smoking hotel. Smoking fee: ' + policies.smoking.penalty}</li>
                <li>• {policies.events.parties}</li>
                <li>• Quiet hours: {policies.events.quietHours}</li>
                <li>• {policies.events.restrictions}</li>
                <li>• {policies.accessibility.features.join(', ')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact for Questions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Have questions about our policies?</p>
          <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
              <Phone className="h-4 w-4" />
              Call Us
            </button>
            <button className="flex items-center gap-2 px-6 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50">
              <Mail className="h-4 w-4" />
              Email Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelPolicies;