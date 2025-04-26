import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';
import { showToast } from '../utils/toast';

const ClientDashboardHeader = () => {
  const { user, setIsAuthenticated ,setUser} = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notifications = [
    { id: 1, message: "You have been outbid on 3BHK Villa!" },
    { id: 2, message: "New auction: Office Space in Bandra" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() !== '') {
      navigate(`/search?query=${search}`);
    }
  };

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
          RealEstate
        </Link>

        {/* Conditional Quick Links based on User Role */}
        {user?.role === 'Client' ? (
          <div className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>
            <Link to="/buy" className="hover:text-yellow-300">Buy</Link>
            <Link to="/sell" className="hover:text-yellow-300">Sell</Link>
            <Link to="/updates" className="hover:text-yellow-300">Updates</Link>
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

      {/* Center: Search Bar */}
      <form onSubmit={handleSearch} className="relative hidden md:block">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by city, property type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent focus:outline-none text-black w-64 placeholder-gray-400"
          />
        </div>
      </form>

      {/* Right: Notifications and Profile */}
      <div className="flex items-center space-x-6 relative">
        {/* Notifications Bell */}
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
            <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded-lg shadow-lg z-20">
              <div className="p-4">
                <h3 className="font-bold mb-2">Notifications</h3>
                {notifications.length === 0 ? (
                  <div className="text-gray-500">No notifications</div>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} className="mb-2 border-b pb-2">
                      {notification.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button onClick={toggleProfileDropdown} className="flex items-center space-x-2 hover:text-yellow-300">
            <FaUserCircle size={30} />
            <span className="hidden md:inline">{user?.name?.split(" ")[0]}</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg z-20">
              <div className="p-4 space-y-2">
                <Link to={`/profile/${user?.username}`} className="block hover:text-blue-600">My Profile</Link>
                <div 
                  onClick={handleLogout} 
                  className="block cursor-pointer text-red-600 hover:text-red-800"
                >
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