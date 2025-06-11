import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaBed,
  FaBath,
  FaMapMarkerAlt,
  FaHome,
  FaTag,
  FaUser,
  FaUserCheck,
  FaGavel,
  FaRupeeSign,
  FaStickyNote,
  FaEdit,
  FaSave,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import BrokerDashboardHeader from '../components/BrokerDashboardHeader';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import APIRoutes from '../utils/APIRoutes';

export default function BrokerListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        const { data } = await axios.get(`${APIRoutes.getBrokerListingDetails}/${id}`, {
          withCredentials: true,
        });
        setListing(data);
        setRemarks(data.listing.remarks || '');
        //console.log('Listing Details:', data);
      } catch (error) {
        console.error('Error fetching listing details:', error);
        if (error?.response?.status === 403) {
          toast.error('You are not authorized to view this listing.');
          navigate('/broker/dashboard');
        } else if (error?.response?.status === 401) {
          toast.error('Please login to continue.');
          navigate('/login');
        } else {
          toast.error('Failed to fetch property details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [id, navigate]);

  const handleSaveRemarks = async () => {
    try {
      await axios.put(
        `${APIRoutes.updateBrokerRemarks}/${id}`,
        { remarks },
        { withCredentials: true }
      );
      setListing((prev) => ({
        ...prev,
        listing: {
          ...prev.listing,
          remarks,
        },
      }));
      setEditMode(false);
      toast.success('Remarks updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update remarks.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center text-lg">Loading...</div>;
  }

  if (!listing) {
    return <div className="min-h-screen flex justify-center items-center text-red-500">Property not found.</div>;
  }

  const { listing: property, biddingStatus, seller, highestBidder, highestBidAmount } = listing;

  return (
    <>
      <BrokerDashboardHeader />

      <div className="bg-gray-100 py-10 px-4 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <img
            src={property.imageUrls?.[0] || '/placeholder.jpg'}
            alt={property.name}
            className="w-full h-96 object-cover"
          />

          <div className="p-6">
            {/* Property Info */}
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
              <FaHome /> {property.name}
            </h1>
            <p className="text-gray-700 mb-2 flex items-center gap-2">
              <FaMapMarkerAlt /> {property.address}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <p className="text-gray-800 flex items-center gap-2">
                <FaTag /> Type: <span className="font-semibold">{property.type}</span>
              </p>
              <p className="text-gray-800 flex items-center gap-2">
                <FaBed /> Bedrooms: {property.bedrooms}
              </p>
              <p className="text-gray-800 flex items-center gap-2">
                <FaBath /> Bathrooms: {property.bathrooms}
              </p>
              <p className="text-green-600 font-semibold flex items-center gap-2">
                <FaRupeeSign /> Start Price: ₹{property.startPrice?.toLocaleString() || 0}
              </p>
            </div>

            {/* Remarks Section - only if buyer exists */}
            {highestBidder && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FaStickyNote /> Remarks
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveRemarks}
                      className="ml-2 text-green-500 hover:text-green-700"
                    >
                      <FaSave />
                    </button>
                  )}
                </h2>
                {!editMode ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{remarks || 'No remarks yet.'}</p>
                ) : (
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full border rounded-lg p-2 text-gray-800"
                    rows={4}
                    placeholder="Enter remarks here..."
                  />
                )}
              </div>
            )}

            {/* Bidding Info */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaGavel /> Bidding Status
              </h2>
              <p className="text-md mb-2">
                <strong>Status:</strong>{' '}
                <span className="capitalize font-medium text-blue-700">{biddingStatus}</span>
              </p>

              {biddingStatus === 'completed' && highestBidder ? (
                <p className="text-md mb-2 text-green-700 flex items-center gap-2">
                  <FaUserCheck />
                  <strong>Highest Bidder:</strong> {highestBidder.username} ({highestBidder.email}) – ₹
                  {highestBidAmount.toLocaleString()}
                </p>
              ) : biddingStatus === 'ongoing' ? (
                <p className="text-md mb-2 text-yellow-700">
                  Bidding is in progress. Current highest bid: ₹{highestBidAmount.toLocaleString()}
                </p>
              ) : (
                <p className="text-md mb-2 text-gray-600">Bidding has not started yet.</p>
              )}
            </div>

            {/* Seller Info */}
            <div className="mt-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaUser /> Seller Details
              </h2>
              <p className="text-md text-gray-800 flex items-center gap-2 mb-2">
                <FaUser /> {seller?.username}
              </p>
              <p className="text-md text-gray-800 flex items-center gap-2 mb-2">
                <FaEnvelope /> {seller?.email}
              </p>
              {seller?.contactNumber && (
                <p className="text-md text-gray-800 flex items-center gap-2">
                  <FaPhone /> {seller.contactNumber}
                </p>
              )}
            </div>

            {/* Buyer Info */}
            {highestBidder && (
              <div className="mt-6 border-t pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaUserCheck /> Buyer Details
                </h2>
                <p className="text-md text-gray-800 flex items-center gap-2 mb-2">
                  <FaUserCheck /> {highestBidder.username}
                </p>
                <p className="text-md text-gray-800 flex items-center gap-2 mb-2">
                  <FaEnvelope /> {highestBidder.email}
                </p>
                {highestBidder?.contactNumber && (
                  <p className="text-md text-gray-800 flex items-center gap-2">
                    <FaPhone /> {highestBidder.contactNumber}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer />
    </>
  );
}
