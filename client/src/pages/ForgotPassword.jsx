import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);  // Track if the request is in progress
  const [message, setMessage] = useState(''); // State for success/error messages
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(APIRoutes.authCheck, { withCredentials: true });
        if (data.isAuthenticated) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [navigate]);

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (email === '') {
      showToast('Please enter your email address', 'error');
      return;
    }
    setLoading(true);  // Disable the button by setting loading to true
    setMessage(''); // Clear previous messages before making the request
    try {
      const { data } = await axios.post(APIRoutes.forgotPassword, { email });
      setLoading(false); // Re-enable the button
      if (data.success) {
        showToast(data.message, 'success');
        setMessage('Password reset link sent successfully! Please check your inbox.'); // Success message
      } else {
        showToast(data.message, 'error');
        setMessage('Failed to send reset link. Please try again.'); // Error message
      }
    } catch (error) {
      setLoading(false); // Re-enable the button
      showToast('Failed to send password reset email.', 'error');
      setMessage('An error occurred while sending the reset link.'); // Error message
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
              disabled={loading} // Disable button when loading
              className={`w-full bg-blue-500 text-white p-4 rounded-lg font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'} transition duration-300`}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Display message after submitting */}
          {message && (
            <p className="text-center text-sm text-gray-600 mt-4">{message}</p>
          )}
          
          <p className="text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <a href="/login" className="text-blue-500 font-semibold hover:underline">Login here</a>
          </p>
        </div>
      </div>
      <Footer /> 
    </div>
  );
};

export default ForgotPassword;
