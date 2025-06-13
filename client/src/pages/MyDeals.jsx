import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { FaHome, FaMapMarkerAlt, FaTag, FaUser, FaUserCheck, FaStickyNote } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import APIRoutes from '../utils/APIRoutes';
import { showToast } from '../utils/toast';

const StarRating = ({ propertyId, brokerId, userId, initialRating, onRate }) => {
  const [hovered, setHovered] = useState(null);
  const [rating, setRating] = useState(initialRating || 0);

  const handleClick = (star) => {
    setRating(star);
    onRate({ propertyId, brokerId, userId, rating: star });
  };

  return (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer text-xl ${star <= (hovered || rating) ? 'text-yellow-500' : 'text-gray-400'}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const MyDeals = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [soldListings, setSoldListings] = useState([]);
  const [boughtListings, setBoughtListings] = useState([]);
  const [ratings, setRatings] = useState({});
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

          // Fetch ratings for each property
          const allProperties = [...(data.bought || []), ...(data.sold || [])];
          const ratingData = {};

          await Promise.all(
            allProperties.map(async (property) => {
              try {
                const res = await axios.get(`${APIRoutes.getRating}/${property._id}`, {
                  params: {
                    brokerId: property.brokerId,
                    userId: user._id,
                  },
                  withCredentials: true,
                });
              //  console.log(`Fetched rating for property ${property._id}:`, res.data);

                if (res.data.success && res.data.rating) {
                  ratingData[property._id] = res.data.rating;
                }
              } catch (error) {
                console.error(`Failed to fetch rating for property ${property._id}`, error);
              }
            })
          );
          console.log('Ratings fetched:', ratingData);
          setRatings(ratingData);
        } else {
          showToast(data.message || 'Failed to fetch deals.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Error fetching deals.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role !== 'Broker') {
      fetchDeals();
    }
  }, [isAuthenticated, user]);

  const handleRating = async ({ propertyId, brokerId, userId, rating }) => {
    try {
      setRatings((prev) => ({ ...prev, [propertyId]: rating }));

      const res = await axios.post(
        `${APIRoutes.rateProperty}/${propertyId}`,
        { brokerId, userId, rating },
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast('Rating submitted successfully!', 'success');
      } else {
        showToast(res.data.message || 'Rating submission failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Something went wrong while rating.', 'error');
    }
  };

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
          <section className="mb-10">
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
                      <p className="text-sm mt-1 text-green-700 font-semibold">
                        Final Price (Your Bid): ₹{property.winningBidAmount?.toLocaleString()}
                      </p>
                      <p className="text-sm mt-1 text-green-700 font-semibold">Status: Purchased</p>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <FaUser /> Seller: {property.seller?.username} ({property.seller?.email})
                      </p>
                      <p className="text-sm text-gray-800 font-medium mt-3 flex items-center gap-2">
                        <FaStickyNote /> Remarks by Broker:
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {property.remarks || 'No remarks available.'}
                      </p>

                      <StarRating
                        propertyId={property._id}
                        brokerId={property.brokerId}
                        userId={user._id}
                        initialRating={ratings[property._id] || 0}
                        onRate={handleRating}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sold Properties */}
          <section>
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
                      <p className="text-sm mt-1 text-blue-700 font-semibold">
                        Final Price (Winning Bid): ₹{property.winningBidAmount?.toLocaleString()}
                      </p>
                      <p className="text-sm mt-1 text-blue-700 font-semibold">Status: Sold</p>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <FaUserCheck /> Buyer: {property.buyer?.username} ({property.buyer?.email})
                      </p>
                      <p className="text-sm text-gray-800 font-medium mt-3 flex items-center gap-2">
                        <FaStickyNote /> Remarks by Broker:
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {property.remarks || 'No remarks available.'}
                      </p>

                      <StarRating
                        propertyId={property._id}
                        brokerId={property.brokerId}
                        userId={user._id}
                        initialRating={ratings[property._id] || 0}
                        onRate={handleRating}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default MyDeals;
