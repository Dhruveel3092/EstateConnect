import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    setLoading(true);
    setMessage(''); 
    try {
      const { data } = await axios.post(APIRoutes.forgotPassword, { email });
      setLoading(false);
      if (data.success) {
        showToast(data.message, 'success');
        setMessage('Password reset link sent successfully! Please check your inbox.');
      } else {
        showToast(data.message, 'error');
        setMessage('Failed to send reset link. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      showToast('Failed to send password reset email.', 'error');
      setMessage('An error occurred while sending the reset link.');
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
              disabled={loading}
              className={`w-full bg-blue-500 text-white p-4 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'} transition duration-300`}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          {message && (
            <p className="text-center text-sm text-gray-600 mt-4">{message}</p>
          )}
          <p className="text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="text-blue-500 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;