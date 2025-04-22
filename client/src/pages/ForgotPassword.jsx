import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
   
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (email === '') {
      showToast('Please enter your email address', 'error');
      return;
    }
    try {
      const { data } = await axios.post(APIRoutes.forgotPassword, { email });
      if (data.success) {
        showToast(data.message, 'success');
        navigate('/');
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Failed to send password reset email.', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex h-full justify-center items-center px-4">
        <div className="w-full max-w-sm p-8 bg-white shadow-lg rounded-lg space-y-6">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Forgot Password</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <button
              type="submit"
              className={`w-full bg-blue-500 text-white p-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-300`}
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
      <Footer />
      <ToastContainer/>
    </div>
  );
};

export default ForgotPassword;