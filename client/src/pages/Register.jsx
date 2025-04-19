import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import Logo from '../assets/app_logo.png';
import home from '../assets/home.png';
import { showToast } from '../utils/toast';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false); 
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); 
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (values.password !== values.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await register(values.username, values.email, values.password);
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1">
        <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-100">
          <img src={home} alt="Dashboard Preview" className="max-w-full h-auto" />
        </div>

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
                type="email"
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

            {errorMessage && (
              <p className="text-red-500 text-center mt-4">{errorMessage}</p> 
            )}

            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-gray-500">or</span>
              <hr className="flex-grow border-gray-300" />
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
  );
};

export default Register;
