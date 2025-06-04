import React, { useEffect, useState } from 'react';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

const BuyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      const { data } = await axios.get(APIRoutes.getAllListings, {
        withCredentials: true,
      });
      console.log('Fetched Listings:', data.listings);
      setListings(data.listings);
    } catch (error) {
      showToast('Failed to load listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

 return (
  <>
    <ClientDashboardHeader />
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
        🏘️ Discover Your Dream Property
      </h1>

      {loading ? (
        <p className="text-center text-lg text-gray-500">Loading listings...</p>
      ) : listings.length === 0 ? (
        <p className="text-center text-lg text-gray-500">No properties available.</p>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing._id}
              onClick={() => navigate(`/listing/${listing._id}`)}
              className="cursor-pointer bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={listing.imageUrls[0] || '/no-image.png'}
                  alt={listing.name}
                  className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full shadow-lg ${
                  listing.type === 'sale' ? 'bg-red-600' : 'bg-green-600'
                } text-white`}>
                  {listing.type.toUpperCase()}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h2 className="text-xl font-bold text-gray-800">{listing.name}</h2>
                <p className="text-gray-500 text-sm">
                  📍 {listing.address}, {listing.location}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {listing.description.length > 90
                    ? `${listing.description.slice(0, 90)}...`
                    : listing.description}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-green-700 text-lg font-semibold">
                    ₹{listing.startPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {listing.bedrooms}BHK • {listing.bathrooms} Bath
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500 mt-3">
                  <span>{listing.furnished ? '🛋️ Furnished' : '🚫 Unfurnished'}</span>
                  <span>{listing.parking ? '🚗 Parking Available' : '❌ No Parking'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer />
    </main>
    <Footer />
  </>
);

};

export default BuyListings;
