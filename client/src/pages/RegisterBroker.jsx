import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { ToastContainer } from 'react-toastify';
import home from '../assets/home.png'; // importing the image

const RegisterBroker = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    licenseNumber: ""
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.password !== values.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await register(values.name, values.email, values.password);
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

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
                name="name"
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

            {errorMessage && (
              <p className="text-red-500 text-center mt-4">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default RegisterBroker;
