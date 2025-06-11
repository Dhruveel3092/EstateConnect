import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { FaHome, FaMapMarkerAlt, FaTag, FaUser, FaUserCheck,FaStickyNote } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import APIRoutes from '../utils/APIRoutes';
import { showToast } from '../utils/toast';

const MyDeals = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [soldListings, setSoldListings] = useState([]);
  const [boughtListings, setBoughtListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        showToast('Please log in to access the brokerage firm', 'error');
        setTimeout(() => navigate('/login'), 1000);
        return;
      }

      if (user?.role === 'Broker') {
        showToast('Brokers cannot access the My Deals page.', 'error');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data } = await axios.get(APIRoutes.getMyDeals, { withCredentials: true });

        if (data.success) {
          setSoldListings(data.sold || []);
          setBoughtListings(data.bought || []);
        //   console.log('Bought Listings:', data.bought);
        //   console.log('Sold Listings:', data.sold);
        } else {
          showToast(data.message || 'Failed to fetch deals.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Something went wrong while fetching deals.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role !== 'Broker') {
      fetchDeals();
    }
  }, [isAuthenticated, user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex justify-center items-center text-lg">Loading your deals...</div>;
  }

  return (
    <>
      <ClientDashboardHeader />
      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">📦 My Deals</h1>

          {/* Bought Properties */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-green-700">🏠 Properties I Bought</h2>
            {boughtListings.length === 0 ? (
              <p className="text-gray-500">You haven’t bought any properties yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {boughtListings.map((property) => (
                  <div key={property._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <img
                      src={property.imageUrls?.[0] || '/placeholder.jpg'}
                      alt={property.name}
                      className="h-60 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <FaHome /> {property.name}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <FaMapMarkerAlt /> {property.address}
                      </p>
                      <p className="text-sm mt-2 flex items-center gap-2 text-gray-700">
                                <FaTag /> Starting Price: ₹{property.startPrice.toLocaleString()}
                                </p>
                                <p className="text-sm mt-1 flex items-center gap-2 text-green-700 font-semibold">
                                Final Price (Your Bid): ₹{property.winningBidAmount?.toLocaleString()}
                        </p>

                      <p className="text-sm mt-1 text-green-700 font-semibold">Status: Purchased</p>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <FaUser /> Seller: {property.seller?.username} ({property.seller?.email})
                      </p>
                      {/* Remarks */}
                      <div className="mt-3">
                        <p className="text-sm text-gray-800 flex items-center gap-2 font-medium">
                          <FaStickyNote /> Remarks by Broker:
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {property.remarks || 'No remarks available.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sold Properties */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">💼 Properties I Sold</h2>
            {soldListings.length === 0 ? (
              <p className="text-gray-500">You haven’t sold any properties yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {soldListings.map((property) => (
                  <div key={property._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <img
                      src={property.imageUrls?.[0] || '/placeholder.jpg'}
                      alt={property.name}
                      className="h-60 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <FaHome /> {property.name}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <FaMapMarkerAlt /> {property.address}
                      </p>
                      <p className="text-sm mt-2 flex items-center gap-2 text-gray-700">
                      <FaTag /> Starting Price: ₹{property.startPrice.toLocaleString()}
                    </p>
                    <p className="text-sm mt-1 flex items-center gap-2 text-blue-700 font-semibold">
                    Final Price (Winning Bid): ₹{property.winningBidAmount?.toLocaleString()}
                    </p>

                      <p className="text-sm mt-1 text-blue-700 font-semibold">Status: Sold</p>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <FaUserCheck /> Buyer: {property.buyer?.username} ({property.buyer?.email})
                      </p>
                      {/* Remarks */}
                      <div className="mt-3">
                        <p className="text-sm text-gray-800 flex items-center gap-2 font-medium">
                          <FaStickyNote /> Remarks by Broker:
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {property.remarks || 'No remarks available.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default MyDeals;
