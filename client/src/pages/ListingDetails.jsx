import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import APIRoutes from '../utils/APIRoutes';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../utils/toast';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchListing();
  }, []);

  const handleBuy = () => {
    showToast('Proceeding to purchase flow...', 'success');
    // navigate or trigger payment
  };

  if (loading) {
    return <p className="text-center mt-10 text-lg text-gray-600">Loading property details...</p>;
  }

  if (!listing) {
    return <p className="text-center mt-10 text-lg text-red-600">Property not found.</p>;
  }

  return (
    <>
      <ClientDashboardHeader />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Image section */}
          <div className="space-y-4">
            <img
              src={listing.imageUrls[0] || '/no-image.png'}
              alt={listing.name}
              className="w-full h-96 object-cover rounded-xl shadow-md"
            />
            {listing.imageUrls.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto">
                {listing.imageUrls.slice(1).map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Additional ${index}`}
                    className="w-28 h-20 object-cover rounded-md border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-800">{listing.name}</h1>
            <p className="text-gray-600">{listing.address}, {listing.location}</p>

            <div className="text-green-700 text-2xl font-bold">
              ₹{listing.startPrice.toLocaleString()}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <p><strong>Type:</strong> {listing.type.toUpperCase()}</p>
              <p><strong>Bedrooms:</strong> {listing.bedrooms}</p>
              <p><strong>Bathrooms:</strong> {listing.bathrooms}</p>
              <p><strong>Furnished:</strong> {listing.furnished ? 'Yes' : 'No'}</p>
              <p><strong>Parking:</strong> {listing.parking ? 'Yes' : 'No'}</p>
              {listing.visitDate && (
                <>
                  <p><strong>Visit Date:</strong> {new Date(listing.visitDate).toLocaleDateString()}</p>
                  <p><strong>Visit Time:</strong> {listing.startTime} - {listing.endTime}</p>
                </>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mt-6 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            <button
              onClick={handleBuy}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg font-medium shadow-lg"
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
