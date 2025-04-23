import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { ToastContainer } from 'react-toastify';
import home from '../assets/home.png';
import { showToast } from '../utils/toast';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const RegisterClient = () => {
  const { isAuthenticated, setIsAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return false;
    } else if (password !== confirmPassword) {
      showToast("Password and confirm password should be same.", "error");
      return false;
    } else if (username.length < 3) {
      showToast("Username should be greater than 3 characters.", "error");
      return false;
    } else if (password.length < 8) {
      showToast("Password should be equal or greater than 8 characters.", "error");
      return false;
    } else if (email === "") {
      showToast("Email is required.", "error");
      return false;
    }

    return true;
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const { data } = await axios.post(APIRoutes.googleLogin,
        { tokenId: response.credential },
        { withCredentials: true }
      );
      if (data.success) {
        showToast(data.message, "success");
        navigate("/dashboard");
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast("Google login failed.", "error");
    }
  };

  const handleGoogleFailure = () => {
    showToast("Google login failed.", "error");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      try {
        const { username, email, password } = values;
        const { data } = await axios.post(APIRoutes.clientRegister,
          { username, email, password },
          { withCredentials: true }
        );

        if (data.success) {
          showToast(data.message, "success");
          setIsAuthenticated(true);
          console.log(user);
          navigate("/dashboard");
        }
        else {
          showToast(data.message, "error");
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-100">
            <img src={home} alt="Real Estate" className="max-w-full h-auto" />
          </div>

          <div className="w-full md:w-1/2 bg-gradient-to-br from-green-100 to-yellow-200 flex flex-col justify-center items-center p-8">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
              <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
                Register
              </h1>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <input
                  type="text"
                  name="username"
                  placeholder="Full Name"
                  onChange={handleChange}
                  className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <span
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                  >
                    {passwordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <span
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                  >
                    {confirmPasswordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>

                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg font-bold transition shadow-md hover:shadow-lg"
                >
                  Register
                </button>
              </form>

              <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-2 text-gray-500">or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="continue_with"
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <ToastContainer />
      </div>
    </GoogleOAuthProvider>
  );
};

export default RegisterClient;