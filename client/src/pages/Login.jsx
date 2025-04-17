import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/app_logo.png';
import home from '../assets/home.png';
import { showToast } from '../utils/toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import APIRoutes from '../utils/APIRoutes';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';

const Login = () => {

  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

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

  const handleValidation = () => {
    const { password, email } = values;
    if (email === "") {
      showToast(
        "Username is required.",
        "error"
      );
      return false;
    } else if (password==="") {
      showToast(
        "Password is required.",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => { 
    event.preventDefault();
    if(handleValidation())
    {
      try {
        const { email, password } = values;
        const { data } = await axios.post(APIRoutes.login,
             { email, password },
             { withCredentials: true }
            );

        if(data.success)
        {
          showToast(data.message, "success");
          navigate("/dashboard");
        }
        else
        {
          showToast(data.message, "error");
        }
      } catch (error) { 
        console.log(error);
        showToast(error.response.data.message, "error");
      }
    }
  }

  const handleChange = (event) => { 
    setValues({...values, [event.target.name]: event.target.value});
  }

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

  return (
    <GoogleOAuthProvider clientId={ import.meta.env.VITE_GOOGLE_CLIENT_ID }>
    <div className="flex h-screen">
      {/* Left Side - Image Section */}
      <div className="w-1/2 bg-white flex items-center justify-center px-3">
        <img src={home} alt="Dashboard Preview" className="max-w-full h-auto" />
      </div>
      {/* Right Side - Login Form */}
      <div className="w-1/2 bg-gradient-to-br from-pink-100 to-orange-100 flex flex-col justify-center items-center p-10">
        <div className="flex items-center mb-8">
          <img src={Logo} alt="Logo" className="h-12 mr-4" />
          <h1 className="text-4xl font-bold text-black">REAL-ESTATE</h1>
        </div>
        
        <div className="w-full max-w-xs">

        <form action="" onSubmit={(event) => handleSubmit(event)}>
          <input 
              type="text" 
              placeholder="Email"  
              name="email"
              onChange={(e) => handleChange(e)}
              className="w-full p-4 mb-4 border rounded-lg bg-white text-black"
            />
          <div className="relative w-full">
            <input 
              type="password" 
              placeholder="Password" 
              name="password"
              onChange={(e) => handleChange(e)}
              className="w-full p-4 mb-4 border rounded-lg bg-white text-black" 
            />
            <span className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400">|</span>
            <Link to="/forgot-password" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-[#FF6B6B] hover:text-[#E63946]">Forgot?</Link>
          </div>
          <button className="w-full bg-[#FF6B6B] text-white p-4 rounded-lg hover:bg-[#E63946] mt-4">LOG IN</button>
        </form>

          <div className="my-4 flex items-center">
            <hr className="flex-grow border-black" />
            <span className="mx-2 text-black font-semibold">or</span>
            <hr className="flex-grow border-black" />
          </div>
          {/* <button className="w-full bg-black text-white p-4 rounded-lg flex items-center justify-center hover:bg-[#0a138b]">
            <span className="mr-2">G</span> SIGN IN WITH GOOGLE
          </button> */}

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
              className="w-full bg-black text-white p-4 rounded-lg flex items-center justify-center hover:bg-[#0a138b]"
            />

          <p className="mt-4 text-center text-black text-sm">
            DON'T HAVE AN ACCOUNT ? <Link to="/register" className="text-[#FF6B6B] font-bold">CREATE ONE.</Link>
          </p>
        </div>
      </div>
    <ToastContainer />
    </div>
    </GoogleOAuthProvider>
  );
};

export default Login;