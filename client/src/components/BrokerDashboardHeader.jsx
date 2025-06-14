import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';
import { showToast } from '../utils/toast';

const BrokerDashboardHeader = () => {
  const { user, setIsAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [assignedListings, setAssignedListings] = useState([]);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
          const fetchAssignedListings = async () => {
        try {
          if (!user?._id) return;
          const res = await axios.get(`${APIRoutes.getBrokerListings}`, {
            withCredentials: true,
          });
          console.log('Assigned Listings:', res.data);

          const data = Array.isArray(res.data) ? res.data : [];
          setAssignedListings(data);
          setFetchError(false);
        } catch (error) {
          console.error('Error fetching assigned listings:', error);
          setAssignedListings([]);
          setFetchError(true);
        }
      };


    fetchAssignedListings();
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post(APIRoutes.logout, {}, { withCredentials: true });
      showToast('Logged out successfully.', 'success');
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <header className="bg-purple-700 text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="flex items-center">
        {/* Left: Logo */}
        <Link to="/" className="text-2xl font-bold text-yellow-300 tracking-wide">
          BrokerEstateConnect
        </Link>

        {/* Right: Nav links and Notification */}
        <div className="flex items-center gap-8 ml-auto text-sm font-medium">
          <Link to="/dashboard" className="hover:text-yellow-300 transition">
            Dashboard
          </Link>
          <Link to="/broker-listing" className="hover:text-yellow-300 transition">
            Listings
          </Link>
          <Link to={`/profile/${user?.username}`} className="hover:text-yellow-300 transition">
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            className="hover:text-yellow-300 transition focus:outline-none"
          >
            Logout
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative hover:text-yellow-300 transition"
            >
              <FaBell size={22} />
              {assignedListings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                  {assignedListings.length}
                </span>
              )}
            </button>

                        {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-96 max-h-80 overflow-y-auto bg-white text-black rounded-lg shadow-lg z-30">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Assigned Listings</h3>

                  {fetchError ? (
                    <p className="text-sm text-red-600">Failed to load notifications.</p>
                  ) : assignedListings.length === 0 ? (
                    <p className="text-sm text-gray-600">No notifications.</p>
                  ) : (
                    assignedListings.map((listing) => (
                      <div key={listing._id} className="text-sm text-gray-800 border-b py-2">
                        <div>
                          You have been assigned a property titled <span className="font-medium">{listing.name}</span> located in <span className="italic">{listing.location}</span>. Starting bid: ₹{listing.startPrice.toLocaleString()}.
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default BrokerDashboardHeader;
