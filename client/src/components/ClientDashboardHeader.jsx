import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';
import { showToast } from '../utils/toast';

const ClientDashboardHeader = () => {
  const { user, setIsAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch new properties added in last 24 hours
  useEffect(() => {
    const fetchRecentProperties = async () => {
      try {
        const { data } = await axios.get(APIRoutes.recentProperties, { withCredentials: true });
        if (data?.properties?.length > 0) {
          const recentNotifications = data.properties.map((property) => ({
            id: property._id,
            message: `New property listed in ${property.location} for ${property.type} with starting price Rs.${property.startPrice}.`,
          }));
          setNotifications(recentNotifications);
        }
      } catch (error) {
        console.error('Error fetching recent properties:', error);
      }
    };

    fetchRecentProperties();
  }, []);

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post(APIRoutes.logout, {}, { withCredentials: true });
      showToast('Logged out successfully.', 'success');
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-blue-700 text-white flex justify-between items-center p-4 shadow-lg sticky top-0 z-50">
      {/* Left: Logo and Navigation */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-2xl font-bold text-yellow-400">
          EstateConnect
        </Link>

        {/* Quick Links */}
        {user?.role === 'Client' ? (
          <div className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>
            <Link to="/buy" className="hover:text-yellow-300">Buy</Link>
            <Link to="/sell" className="hover:text-yellow-300">Sell</Link>
            <Link to="/my-deals" className="hover:text-yellow-300">My Deals</Link>
            <Link to="/brokerage-firm" className="hover:text-yellow-300">Brokerage Firm</Link>
          </div>
        ) : user?.role === 'Broker' ? (
          <div className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>
            <Link to="/my-listings" className="hover:text-yellow-300">My Listings</Link>
            <Link to="/my-auctions" className="hover:text-yellow-300">My Auctions</Link>
            <Link to="/activity" className="hover:text-yellow-300">Activity</Link>
            <Link to="/payments" className="hover:text-yellow-300">Payments</Link>
          </div>
        ) : (
          <div className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>
          </div>
        )}
      </div>

      {/* Right: Notifications and Profile */}
      <div className="flex items-center space-x-6 relative">
        {/* Notifications */}
        <div className="relative">
          <button onClick={toggleNotificationsDropdown} className="relative hover:text-yellow-300">
            <FaBell size={24} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {notifications.length}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
              <div className="p-4 sticky top-0 bg-white z-10 border-b">
                <h3 className="font-bold">Notifications</h3>
              </div>
              <div className="p-4 pt-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="text-sm border-b pb-2">
                      {notification.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={toggleProfileDropdown} className="flex items-center space-x-2 hover:text-yellow-300">
            <FaUserCircle size={30} />
            <span className="hidden md:inline">{user?.name?.split(" ")[0]}</span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg z-20">
              <div className="p-4 space-y-2">
                <Link to={`/profile/${user?.username}`} className="block hover:text-blue-600">My Profile</Link>
                <div onClick={handleLogout} className="block cursor-pointer text-red-600 hover:text-red-800">
                  Logout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardHeader;
