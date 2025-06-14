import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ClientDashboardHeader />

      <div className="bg-gradient-to-r from-blue-500 to-purple-500 py-8 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">
          Welcome, {user?.username || 'User'}!
        </h1>
        <p className="mt-2 text-lg text-blue-200 text-center">
          Great to see you back.
        </p>
      </div>

      <div className="flex-1 p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
          <p className="text-gray-600">
            Explore your real estate activities below.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Listings */}
          <div className="bg-white rounded-xl shadow hover:shadow-2xl transition p-6">
            <h3 className="text-xl font-semibold text-blue-600">My Listings</h3>
            <p className="mt-2 text-gray-600">
              Manage and update your real estate listings.
            </p>
            <button
              onClick={() => navigate('/my-deals')}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              View Listings
            </button>
          </div>

          {/* My Auctions */}
          <div className="bg-white rounded-xl shadow hover:shadow-2xl transition p-6">
            <h3 className="text-xl font-semibold text-green-600">My Auctions</h3>
            <p className="mt-2 text-gray-600">
              Participate and manage your auctions.
            </p>
            <button
              onClick={() => navigate('/buy')}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              View Auctions
            </button>
          </div>

          {/* Brokerage Firm */}
          <div className="bg-white rounded-xl shadow hover:shadow-2xl transition p-6">
            <h3 className="text-xl font-semibold text-purple-600">Brokerage Firm</h3>
            <p className="mt-2 text-gray-600">
              Connect with brokers and manage property deals.
            </p>
            <button
              onClick={() => navigate('/brokerage-firm')}
              className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Explore Brokers
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
