import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import Logo from '../assets/app_logo.png';
import home from '../assets/home.png';
import { showToast } from '../utils/toast';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    // Redirect only if user is authenticated and currently on the login page
    if (isAuthenticated && location.pathname === '/login') {
      navigate("/dashboard");
    }
  }, [isAuthenticated, location, navigate]);

  const handleValidation = () => {
    const { email, password } = values;
    if (email === "") {
      showToast("Email is required.", "error");
      return false;
    } else if (password === "") {
      showToast("Password is required.", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      try {
        const { email, password } = values;
        const { data } = await axios.post(APIRoutes.login, { email, password }, { withCredentials: true });
        if (data.success) {
          login(data.user);
          showToast(data.message, "success");
          navigate("/dashboard");
        } else {
          showToast(data.message, "error");
        }
      } catch (error) {
        console.log(error);
        showToast(error.response?.data?.message || "Login failed", "error");
      }
    }
  };

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const { data } = await axios.post(APIRoutes.googleLogin, { tokenId: response.credential }, { withCredentials: true });
      if (data.success) {
        login(data.user);
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

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <div className="flex flex-1">
          {/* Left Side */}
          <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-100">
            <img src={home} alt="Dashboard Preview" className="max-w-full h-auto" />
          </div>

          {/* Right Side */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-pink-100 to-orange-100 flex flex-col justify-center items-center p-8">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-center mb-6">
                <img src={Logo} alt="Logo" className="h-12 mr-2" />
                <h1 className="text-3xl font-bold text-blue-600">REAL-ESTATE</h1>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Email"
                  name="email"
                  onChange={handleChange}
                  className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    onChange={handleChange}
                    className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <span
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  >
                    {passwordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg font-bold transition"
                >
                  Log In
                </button>
              </form>

              <div className="text-center mt-4">
                <Link to="/forgot-password" className="text-sm text-blue-500 font-semibold hover:underline">
                  Forgot Password?
                </Link>
              </div>

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

              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-500 font-semibold hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        <Footer />
        <ToastContainer />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;