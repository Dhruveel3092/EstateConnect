import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import Logo from '../assets/app_logo.png';
import home from '../assets/home.png';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import password visibility icons

const Register = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false); // State for toggling password visibility
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State for toggling confirm password visibility

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(APIRoutes.authCheck, { withCredentials: true });
        if (data.isAuthenticated) navigate("/dashboard");
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (password !== confirmPassword) {
      showToast("Password and confirm password should be the same.", "error");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      try {
        const { username, email, password } = values;
        const { data } = await axios.post(APIRoutes.register, { username, email, password }, { withCredentials: true });
        if (data.success) {
          showToast(data.message, "success");
          navigate("/dashboard");
        } else {
          showToast(data.message, "error");
        }
      } catch (error) {
        console.log(error);
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
          {/* Left Side - Image */}
          <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-100">
            <img src={home} alt="Dashboard Preview" className="max-w-full h-auto" />
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-pink-100 to-orange-100 flex flex-col justify-center items-center p-8">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-center mb-6">
                <img src={Logo} alt="Logo" className="h-12 mr-2" />
                <h1 className="text-3xl font-bold text-blue-600">REAL-ESTATE</h1>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  onChange={handleChange}
                  className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
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
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    onChange={handleChange}
                    className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <span
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  >
                    {confirmPasswordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </span>
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg font-bold transition"
                >
                  Create Account
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

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 font-semibold hover:underline">
                  Login
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

export default Register;
