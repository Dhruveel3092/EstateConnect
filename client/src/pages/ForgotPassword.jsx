import React, { useState } from 'react';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(APIRoutes.authCheck, { withCredentials: true });
        // console.log(data);
        if(data.isAuthenticated)
        {
          navigate("/dashboard");
        }
    } catch (error) {
      console.log(error)
    }
    };
    fetchData();
  }, []);

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(APIRoutes.forgotPassword, { email });
      if (data.success) {
        showToast(data.message, 'success');
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Failed to send password reset email.', 'error');
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-[#c5e6fb]">
      <div className="w-full max-w-xs">
        <h1 className="text-3xl font-bold text-black mb-8">Forgot Password</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            className="w-full p-4 mb-4 border rounded-lg bg-white text-black"
          />
          <button type="submit" className="w-full bg-black text-white p-4 rounded-lg hover:bg-[#0a138b]">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;