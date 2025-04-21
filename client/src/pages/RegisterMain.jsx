import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RegisterMain = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1 items-center justify-center bg-gradient-to-r from-blue-100 to-purple-200 p-8">
        <div className="bg-white shadow-2xl rounded-2xl p-10 flex flex-col items-center gap-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-blue-600">Register As</h1>
          
          <button
            onClick={() => navigate('/register-broker')}
            className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition text-lg"
          >
            Register as Broker
          </button>

          <button
            onClick={() => navigate('/register-client')}
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition text-lg"
          >
            Register as Buyer / Seller
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterMain;
