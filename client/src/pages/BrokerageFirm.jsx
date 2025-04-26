import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import APIRoutes from '../utils/APIRoutes';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';

const BrokerageFirm = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth(); // Access user from AuthContext
  const [brokers, setBrokers] = useState([]);
  const [brokersLoading, setBrokersLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !isAuthenticated) {
      showToast('Please log in to access the brokerage firm', 'error');
      navigate('/login');
    }

    // Check if the user is a Broker, and redirect to dashboard
    if (user?.role === 'Broker') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate, user]);  // Added `user` dependency

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const { data } = await axios.get(APIRoutes.getAllBrokers, { withCredentials: true });
        setBrokers(data.brokers || []);
      } catch (error) {
        console.error('Failed to fetch brokers:', error);
      } finally {
        setBrokersLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBrokers();
    }
  }, [isAuthenticated]);

  if (loading) return null;  // Don’t render anything until auth check is done

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ClientDashboardHeader />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-12">Brokerage Firm</h1>

        <div className="flex flex-col items-center gap-10">
          {brokers.map((broker) => (
            <div
              key={broker.username}
              className="w-full max-w-md bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105 p-6 flex flex-col items-center"
            >
              <div className="w-28 h-28 mb-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={broker.profilePicture || 'https://via.placeholder.com/150'}
                  alt={`${broker.name}'s Profile`}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{broker.username}</h2>
              <p className="text-gray-500 mb-2">{broker.location}</p>

              <span className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                {broker.rating} ★
              </span>

              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Commission:</span> {broker.commissionPercentage}%
                </div>
                <Link
                  to={`/broker/profile/${broker.username}`}
                  state={broker}
                  className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrokerageFirm;
