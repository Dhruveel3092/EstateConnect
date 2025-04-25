import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientDashboardHeader from '../components/ClientDashboardHeader';

const BrokerProfileDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [brokerData, setBrokerData] = useState(null);

  useEffect(() => {    
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      if (!location.state) {
        // If broker data not provided in location.state, redirect accordingly
        if (user && user.role === 'Broker') {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } else {
        // Destructure broker data and store it in state
        const {
          username,
          profilePicture,
          location: brokerLocation,
          rating,
          commissionPercentage,
          companyName,
          contactNumber,
          email,
          licenseNumber,
        } = location.state;
        setBrokerData({
          username,
          profilePicture,
          brokerLocation,
          rating,
          commissionPercentage,
          companyName,
          contactNumber,
          email,
          licenseNumber,
        });
      }
    }
  }, [isAuthenticated, location.state, navigate, user]);

  // If brokerData is not set, render nothing (no loading indicator)
  if (!brokerData) return null;

  // Destructure brokerData for rendering
  const {
    username,
    profilePicture,
    brokerLocation,
    rating,
    commissionPercentage,
    companyName,
    contactNumber,
    email,
    licenseNumber,
  } = brokerData;
  const name = username;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <ClientDashboardHeader />

      {/* Main Section */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/brokerage-firm')}
            className="bg-gray-500 text-white px-4 py-2 rounded-full"
          >
            Back to Brokerage Firm
          </button>
        </div>

        {/* Profile Information */}
        <div className="flex flex-col md:flex-row bg-white p-6 rounded-lg shadow-md">
          {/* Profile Picture */}
          <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-6 md:mb-0 md:mr-6">
            <img
              src={profilePicture || 'https://via.placeholder.com/150'}
              alt={`${username}'s Profile`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Details */}
          <div className="flex flex-col justify-between">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">{name}</h2>
            <p className="text-lg text-gray-500">{brokerLocation}</p>

            {/* Rating */}
            <div className="flex items-center my-2">
              <span className="text-yellow-400 text-xl">{'★'.repeat(rating)}</span>
              <span className="text-gray-500 ml-2">{rating} ★</span>
            </div>

            {/* Commission */}
            <div className="text-lg text-gray-700 mt-2">
              <span className="font-medium">Commission:</span> {commissionPercentage}%
            </div>

            {/* Company Name */}
            <div className="text-lg text-gray-700 mt-2">
              <span className="font-medium">Company Name:</span> {companyName}
            </div>

            {/* License Number */}
            <div className="text-lg text-gray-700 mt-2">
              <span className="font-medium">License Number:</span> {licenseNumber}
            </div>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              {email && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">Email:</span>
                  <a
                    href={`mailto:${email}`}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    {email}
                  </a>
                </div>
              )}
              {contactNumber && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-600">{contactNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/brokerage-firm')}
            className="bg-gray-600 text-white px-6 py-2 rounded-full text-lg hover:bg-gray-700 transition"
          >
            Back to Brokers
          </button>
          <button
            onClick={() => navigate(`/broker/edit/${username}`)}
            className="bg-yellow-500 text-white px-6 py-2 rounded-full text-lg hover:bg-yellow-600 transition"
          >
            Edit Profile
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BrokerProfileDetails;