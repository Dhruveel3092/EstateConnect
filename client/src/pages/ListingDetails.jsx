import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import APIRoutes from '../utils/APIRoutes';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../utils/toast';
import {
  MapPin, BedDouble, Bath, Car, CalendarDays, Clock, User, Mail, Phone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      showToast('Please log in to access it', 'error');
      navigate('/login');
    }
    if (user?.role === 'Broker') {
      showToast('Brokers cannot access the Buy Listings page.', 'error');
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`${APIRoutes.getSingleListing}/${id}`, {
          withCredentials: true,
        });
        setListing(data.listing);
      } catch (error) {
        showToast('Failed to load property details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleBuy = () => {
    showToast('Proceeding to purchase flow...', 'success');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <p className="text-center mt-10 text-lg text-gray-600">Loading property details...</p>;
  }

  if (!listing) {
    return <p className="text-center mt-10 text-lg text-red-600">Property not found.</p>;
  }

  const hasMultipleImages = listing.imageUrls?.length > 1;

  const sliderSettings = {
    dots: hasMultipleImages,
    infinite: hasMultipleImages,
    speed: 700,
    fade: hasMultipleImages,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: hasMultipleImages,
    autoplaySpeed: 4000,
    arrows: hasMultipleImages,
  };

  return (
    <>
      <ClientDashboardHeader />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Image Slideshow */}
          <div className="space-y-4">
            {listing.imageUrls?.length > 0 ? (
              <Slider {...sliderSettings}>
                {listing.imageUrls.map((url, idx) => (
                  <div key={idx}>
                    <img
                      src={url}
                      alt={`Property Image ${idx + 1}`}
                      className="w-full h-96 object-cover rounded-2xl shadow-lg"
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <img
                src="/no-image.png"
                alt="No image available"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            )}
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">{listing.name}</h1>

            <p className="text-gray-600 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              {listing.address}, {listing.location}
            </p>

            <div className="text-3xl font-bold text-blue-600">
              ₹{listing.startPrice.toLocaleString()}
            </div>

            {/* Broker Details */}
            {listing.brokerIds?.length > 0 && (
              <div className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">Brokers Assigned</h2>
                {listing.brokerIds.map((broker) => (
                  <div
                    key={broker._id}
                    className="p-4 bg-gray-50 border rounded-lg shadow-sm space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{broker.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-600" />
                      <span>{broker.email}</span>
                    </div>
                    {broker.contactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-600" />
                        <span>{broker.contactNumber}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-indigo-600" />
                <span>{listing.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-pink-600" />
                <span>{listing.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-green-600" />
                <span>{listing.parking ? 'Parking Available' : 'No Parking'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 font-medium">
                  {listing.furnished ? 'Furnished' : 'Unfurnished'}
                </span>
              </div>
              <div>
                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Type: {listing.type.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  Listed on: {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Visit Info */}
            {listing.visitDate && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">
                    Visit Date: {new Date(listing.visitDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">
                    Time: {formatTime(listing.startTime)} – {formatTime(listing.endTime)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            <button
              onClick={handleBuy}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg transition duration-300"
            >
              Buy Now
            </button>
          </div>
        </div>
        <ToastContainer />
      </main>
      <Footer />
    </>
  );
};

export default ListingDetails;
