import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (values.newPassword !== values.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (values.newPassword.length < 6) {
      showToast('Password should be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(APIRoutes.resetPassword, {
        token,
        newPassword: values.newPassword,
      });
      if (data.success) {
        showToast(data.message, 'success');
        navigate('/login');
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Failed to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Reset Your Password</h1>
            <p className="mt-2 text-sm text-gray-500">Enter a new password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={values.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={values.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              } transition duration-300`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <a href="/login" className="text-blue-500 font-semibold hover:underline">
              Login here
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;
