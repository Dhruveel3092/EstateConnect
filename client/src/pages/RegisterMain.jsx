import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import home from '../assets/home.png'; // use same home image

const RegisterMain = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1">
        {/* Left side with Image */}
        <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-100">
          <img src={home} alt="Real Estate" className="max-w-full h-auto" />
        </div>

        {/* Right side with buttons */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col justify-center items-center p-8">
          <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
              Register As
            </h1>

            <div className="flex flex-col gap-6">
              <button
                onClick={() => navigate('/register-broker')}
                className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition text-lg shadow-md hover:shadow-lg"
              >
                Register as Broker
              </button>

              <button
                onClick={() => navigate('/register-client')}
                className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition text-lg shadow-md hover:shadow-lg"
              >
                Register as Buyer / Seller
              </button>
            </div>

            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-gray-500">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-500 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterMain;
