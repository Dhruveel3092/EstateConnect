import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import APIRoutes from '../utils/APIRoutes';
import { showToast } from '../utils/toast';
import home from '../assets/home.png';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';

const RegisterBroker = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    licenseNumber: ""
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);


  const handleValidation = () => {
    const { password, confirmPassword, username, email, companyName, licenseNumber } = values;
    
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
    } else if (companyName === "") {
      showToast("Company Name is required.", "error");
      return false;
    } else if (licenseNumber === "") {
      showToast("License Number is required.", "error");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (event) => { 
    event.preventDefault();
    if(handleValidation())
    {
      try {
        const { username, email, password, companyName, licenseNumber } = values;
        const { data } = await axios.post(APIRoutes.brokerRegister,
             { username, email, password, companyName, licenseNumber },
             { withCredentials: true }
            );

        if(data.success)
        {
          showToast(data.message, "success");
          setIsAuthenticated(true);
          navigate("/dashboard");
        }
        else
        {
          showToast(data.message, "error");
        }
      } catch (error) { 
        console.log(error);
      }
    }
  }

  const handleChange = (event) => { 
    setValues({...values, [event.target.name]: event.target.value});
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1">
        {/* Left side image */}
        <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-100">
          <img src={home} alt="Real Estate" className="max-w-full h-auto" />
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-100 to-blue-200 flex flex-col justify-center items-center p-8">
          <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
            <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
              Broker Registration
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input
                type="text"
                name="username"
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                onChange={handleChange}
                className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="licenseNumber"
                placeholder="License Number"
                onChange={handleChange}
                className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="w-full p-4 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg font-bold transition shadow-md hover:shadow-lg"
              >
                Register as Broker
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default RegisterBroker;