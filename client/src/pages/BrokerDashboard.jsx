import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrokerDashboardHeader from '../components/BrokerDashboardHeader';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const BrokerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <BrokerDashboardHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-10 px-6 shadow-md">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
          Welcome, Broker {user?.username || 'User'}!
        </h1>
        <p className="mt-2 text-lg text-blue-200 text-center">
          Manage your listings and grow your network.
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 p-6 md:p-10">
        <section className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-blue-600">My Listings</h2>
            <p className="mt-2 text-gray-600">
              Create, view, and manage your current property listings in one place.
            </p>
            <button
              onClick={() => navigate('/broker-listing')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition"
            >
              Go to Listings
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default BrokerDashboard;
