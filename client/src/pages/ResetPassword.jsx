import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (values.newPassword !== values.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
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
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="w-full max-w-xs">
        <h1 className="text-3xl font-bold text-black mb-8">Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            name="newPassword"
            value={values.newPassword}
            onChange={handleChange}
            className="w-full p-4 mb-4 border rounded-lg bg-white text-black"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            className="w-full p-4 mb-4 border rounded-lg bg-white text-black"
          />
          <button type="submit" className="w-full bg-black text-white p-4 rounded-lg hover:bg-[#0a138b]">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;