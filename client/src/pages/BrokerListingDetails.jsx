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
  FaCheckCircle,
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
      } catch (error) {
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
      setListing(prev => ({
        ...prev,
        listing: {
          ...prev.listing,
          remarks,
        },
      }));
      setEditMode(false);
      toast.success('Remarks updated successfully!');
    } catch {
      toast.error('Failed to update remarks.');
    }
  };

  const handleVerifyProperty = async () => {
    try {
      await axios.put(`${APIRoutes.verifyListing}/${id}`, {}, { withCredentials: true });
      setListing(prev => ({
        ...prev,
        listing: {
          ...prev.listing,
          isVerified: true,
        },
      }));
      toast.success('Property verified successfully!');
    } catch {
      toast.error('Failed to verify property.');
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center text-lg">Loading...</div>;
  if (!listing) return <div className="min-h-screen flex justify-center items-center text-red-500">Property not found.</div>;

  const { listing: property, biddingStatus, seller, highestBidder, highestBidAmount, allBidders } = listing;

  return (
    <>
      <BrokerDashboardHeader />

      <div className="bg-gray-50 py-10 px-4 min-h-screen">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <img
            src={property.imageUrls?.[0] || '/placeholder.jpg'}
            alt={property.name}
            className="w-full h-96 object-cover rounded-t-2xl"
          />

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold flex items-center gap-2">
                <FaHome className="text-blue-600" /> {property.name}
                {property.isVerified && (
                  <span className="ml-3 text-green-600 text-lg flex items-center gap-1">
                    <FaCheckCircle /> Verified
                  </span>
                )}
              </h1>
              {!property.isVerified && (
                <button
                  onClick={handleVerifyProperty}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                >
                  Verify
                </button>
              )}
            </div>

            <p className="text-gray-600 flex items-center gap-2 text-lg">
              <FaMapMarkerAlt /> {property.address}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-lg text-gray-800">
              <div className="flex items-center gap-2"><FaTag /> {property.type}</div>
              <div className="flex items-center gap-2"><FaBed /> {property.bedrooms} Bedrooms</div>
              <div className="flex items-center gap-2"><FaBath /> {property.bathrooms} Bathrooms</div>
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <FaRupeeSign /> ₹{property.startPrice?.toLocaleString()}
              </div>
            </div>

            {highestBidder && (
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <FaStickyNote /> Remarks
                  {editMode ? (
                    <button
                      onClick={handleSaveRemarks}
                      className="ml-3 text-green-600 hover:text-green-800"
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="ml-3 text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                  )}
                </h2>
                {editMode ? (
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full border mt-2 p-3 rounded-lg text-gray-800"
                    rows={4}
                    placeholder="Enter remarks here..."
                  />
                ) : (
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{remarks || 'No remarks yet.'}</p>
                )}
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <FaGavel /> Bidding
              </h2>
              <p className="mt-2 text-blue-800 font-medium">Status: {biddingStatus}</p>
              {biddingStatus === 'completed' && highestBidder ? (
                <p className="text-green-700 flex items-center gap-2 mt-2">
                  <FaUserCheck /> {highestBidder.username} ({highestBidder.email}) – ₹{highestBidAmount.toLocaleString()}
                </p>
              ) : biddingStatus === 'ongoing' ? (
                <p className="text-yellow-700 mt-2">Current highest bid: ₹{highestBidAmount.toLocaleString()}</p>
              ) : (
                <p className="text-gray-600 mt-2">Bidding has not started yet.</p>
              )}
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <FaUser /> Seller
              </h2>
              <p className="mt-2 text-gray-700"><FaUser /> {seller?.username}</p>
              <p className="text-gray-700"><FaEnvelope /> {seller?.email}</p>
              {seller?.contactNumber && (
                <p className="text-gray-700"><FaPhone /> {seller.contactNumber}</p>
              )}
            </div>

            {highestBidder && (
              <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <FaUserCheck /> Buyer
                </h2>
                <p className="mt-2 text-gray-700"><FaUserCheck /> {highestBidder.username}</p>
                <p className="text-gray-700"><FaEnvelope /> {highestBidder.email}</p>
                {highestBidder.contactNumber && (
                  <p className="text-gray-700"><FaPhone /> {highestBidder.contactNumber}</p>
                )}
              </div>
            )}

            {allBidders?.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <FaUserCheck /> All Bidders
                </h2>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full border text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 border">#</th>
                        <th className="px-4 py-2 border">Username</th>
                        <th className="px-4 py-2 border">Email</th>
                        <th className="px-4 py-2 border">Contact</th>
                        <th className="px-4 py-2 border">Bid Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBidders.map((bidder, i) => (
                        <tr key={bidder._id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 border">{i + 1}</td>
                          <td className="px-4 py-2 border">{bidder.username}</td>
                          <td className="px-4 py-2 border">{bidder.email}</td>
                          <td className="px-4 py-2 border">{bidder.contactNumber || 'N/A'}</td>
                          <td className="px-4 py-2 border">₹{bidder.amount?.toLocaleString() || '0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
