import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import  APIRoutes  from '../utils/APIRoutes'; // Assuming your APIRoutes

const brokers = [
  {
    username: 'brokerJohn',
    name: 'John Doe',
    location: 'New York, NY',
    rating: 4.5,
    commissionPercentage: 6,
  },
  {
    username: 'brokerJane',
    name: 'Jane Smith',
    location: 'Los Angeles, CA',
    rating: 4.8,
    commissionPercentage: 5,
  },
  {
    username: 'brokerAlex',
    name: 'Alex Johnson',
    location: 'Chicago, IL',
    rating: 4.2,
    commissionPercentage: 7,
  },
];

const BrokerageFirm = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const { data } = await axios.get(APIRoutes.authCheck, { withCredentials: true });
        setIsAuthenticated(data.isAuthenticated);

        if (!data.isAuthenticated) {
          navigate('/login');
        }
      } catch (error) {
        console.error(error);
        navigate('/login'); // if API fails, safer to redirect
      }
    };

    fetchAuthStatus();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ClientDashboardHeader />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-12">Brokerage Firm</h1>

        <div className="flex flex-col items-center gap-10">
          {brokers.map((broker) => (
            <Link
              key={broker.username}
              to={`/profile/${broker.username}`}
              className="w-full max-w-md bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105 p-6 flex flex-col items-center"
            >
              <div className="w-28 h-28 mb-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-4xl text-gray-400">👤</span>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{broker.name}</h2>
              <p className="text-gray-500 mb-2">{broker.location}</p>

              <span className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                {broker.rating} ★
              </span>

              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Commission:</span> {broker.commissionPercentage}%
                </div>
                <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  View Profile
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrokerageFirm;
