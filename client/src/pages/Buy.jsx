// BuyListings.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';
import indianCities from '../utils/indianCities';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../utils/toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const BuyListings = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('latest');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [bhkFilter, setBhkFilter] = useState('');
  const [bathFilter, setBathFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, loading: authLoading, user } = useAuth(); // Access user from AuthContext
  
  const navigate = useNavigate();

    useEffect(() => {
     // Check if user is authenticated
     if (!authLoading && !isAuthenticated) {
       showToast('Please log in to access the brokerage firm', 'error');
       navigate('/login');
     }
 
     // Check if the user is a Broker, and redirect to dashboard
     if (user?.role === 'Broker') {
      showToast('Brokers cannot access the Buy Listings page.', 'error');
       navigate('/dashboard');
     }
   }, [isAuthenticated, authLoading, navigate, user]); 

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data } = await axios.get(APIRoutes.getAllListings, { withCredentials: true });
        setListings(data.listings);
        setFilteredListings(data.listings);
      } catch (error) {
        showToast('Failed to load listings.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    let filtered = listings;

    if (locationFilter) {
      filtered = filtered.filter(listing =>
        listing.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(listing => {
        const price = listing.startPrice;
        return (
          (!priceRange.min || price >= parseInt(priceRange.min)) &&
          (!priceRange.max || price <= parseInt(priceRange.max))
        );
      });
    }

    if (bhkFilter) {
      filtered = filtered.filter(listing => listing.bedrooms === parseInt(bhkFilter));
    }

    if (bathFilter) {
      filtered = filtered.filter(listing => listing.bathrooms === parseInt(bathFilter));
    }

    if (typeFilter) {
      filtered = filtered.filter(listing => listing.type === typeFilter);
    }

    const sortListings = (listings, sortOption) => {
      let sorted = [...listings];
      if (sortOption === 'latest') {
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortOption === 'priceLowHigh') {
        sorted.sort((a, b) => a.startPrice - b.startPrice);
      } else if (sortOption === 'priceHighLow') {
        sorted.sort((a, b) => b.startPrice - a.startPrice);
      }
      return sorted;
    };

    setFilteredListings(sortListings(filtered, sortOption));
  }, [sortOption, locationFilter, priceRange, bhkFilter, bathFilter, typeFilter, listings]);

  return (
    <>
      <ClientDashboardHeader />
      <main className="max-w-7xl mx-auto px-4 py-12 flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-72 hidden lg:block">
          <h2 className="text-xl font-bold mb-4">Filters</h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Location</h3>
            <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl shadow-sm"
                    >
                    <option value="">All Locations</option>
                    {indianCities.map((city) => (
                    <option key={city} value={city}>
                    {city}
                    </option>
                    ))}
            </select>

          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Price Range</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-1/2 px-3 py-2 border rounded-xl shadow-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-1/2 px-3 py-2 border rounded-xl shadow-sm"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">BHK</h3>
            {[1, 2, 3, 4, 5].map((bhk) => (
              <div key={bhk} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bhk"
                  value={bhk}
                  checked={bhkFilter === String(bhk)}
                  onChange={(e) => setBhkFilter(e.target.value)}
                />
                <label>{bhk} BHK</label>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Bathrooms</h3>
            {[1, 2, 3, 4].map((bath) => (
              <div key={bath} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="bath"
                  value={bath}
                  checked={bathFilter === String(bath)}
                  onChange={(e) => setBathFilter(e.target.value)}
                />
                <label>{bath} Bath</label>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Property Type</h3>
            {['sale', 'rent'].map((type) => (
              <div key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={typeFilter === type}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
                <label className="capitalize">{type}</label>
              </div>
            ))}
          </div>

          <button
            className="text-blue-600 hover:underline mt-4"
            onClick={() => {
              setLocationFilter('');
              setPriceRange({ min: '', max: '' });
              setBhkFilter('');
              setBathFilter('');
              setTypeFilter('');
            }}
          >
            Clear All Filters
          </button>
        </aside>

        {/* Listing Area */}
        <section className="flex-1">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">
            Discover Your Dream Property
          </h1>

          <div className="flex justify-end mb-6">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 border rounded-xl shadow-sm"
            >
              <option value="latest">Sort by: Latest</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <p className="text-center text-lg text-gray-500">Loading listings...</p>
          ) : filteredListings.length === 0 ? (
            <p className="text-center text-lg text-gray-500">No properties available.</p>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => (
                <div
                  key={listing._id}
                  onClick={() => navigate(`/listing/${listing._id}`)}
                  className="cursor-pointer bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={listing.imageUrls[0] || '/no-image.png'}
                      alt={listing.name}
                      className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span
                      className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full shadow ${{
                        sale: 'bg-red-600',
                        rent: 'bg-green-600',
                      }[listing.type]} text-white`}
                    >
                      {listing.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">{listing.name}</h2>
                    <p className="text-gray-500 text-sm">
                      {listing.address}, {listing.location}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {listing.description.length > 90
                        ? `${listing.description.slice(0, 90)}...`
                        : listing.description}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-green-700 font-medium text-lg">
                        ₹{listing.startPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-700">
                        {listing.bedrooms}BHK • {listing.bathrooms} Bath
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <ToastContainer />
      </main>
      <Footer />
    </>
  );
};

export default BuyListings;