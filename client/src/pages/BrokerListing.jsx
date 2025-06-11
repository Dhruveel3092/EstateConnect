import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import BrokerDashboardHeader from '../components/BrokerDashboardHeader';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import APIRoutes from '../utils/APIRoutes';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Bath,
  MapPin,
  IndianRupee,
  Home,
  ArrowRight,
} from 'lucide-react';

export default function BrokerListings() {
  const { user, isAuthenticated, loading } = useAuth();
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast.error('Please log in to access your listings.');
        navigate('/login');
      } else {
        fetchListings();
      }
    }
  }, [isAuthenticated, loading]);

  const fetchListings = async () => {
    try {
      const { data } = await axios.get(APIRoutes.getBrokerListings, {
        withCredentials: true,
      });
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to fetch listings.');
    } finally {
      setListingsLoading(false);
    }
  };

  
        const handleCardClick = (id) => {
        navigate(`/broker/listing/${id}`);
        };

  if (loading || listingsLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <BrokerDashboardHeader />
      <div className="bg-gray-50 py-12 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-10">
            <Home className="inline-block w-8 h-8 mr-2 text-blue-600" />
            Your Assigned Listings
          </h1>
          {listings.length === 0 ? (
            <div className="text-center text-gray-500">No listings assigned yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg cursor-pointer hover:scale-[1.02] duration-300"
                  onClick={() => handleCardClick(listing._id)}
                >
                  <img
                    src={listing.imageUrls?.[0] || '/placeholder.jpg'}
                    alt={listing.name}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-1">{listing.name}</h2>
                    <p className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.address}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-700 mb-2">
                      <span className="flex items-center">
                        <BedDouble className="w-4 h-4 mr-1" />
                        {listing.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {listing.bathrooms}
                      </span>
                    </div>
                    <p className="text-sm">
                      Type: <span className="font-medium">{listing.type}</span>
                    </p>
                    <p className="flex items-center text-green-600 font-semibold text-sm mt-2">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      Start Price: ₹{listing.startPrice.toLocaleString()}
                    </p>
                    <div className="flex justify-end mt-4">
                      <span className="text-blue-600 hover:underline flex items-center">
                        View Details <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
}
