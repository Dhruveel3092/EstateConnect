import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import RegisterMain from "./pages/RegisterMain";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RegisterBroker from "./pages/RegisterBroker";
import RegisterClient from "./pages/RegisterClient";
import BrokerageFirm from "./pages/BrokerageFirm";
import Profile from "./pages/Profile";
import BrokerProfileDetails from "./pages/BrokerProfileDetails";
import CreateListing from "./pages/sell";
import Buy from "./pages/Buy";
import ListingDetails from "./pages/ListingDetails";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/register" element={<RegisterMain />} />
        <Route path="/register-broker" element={<RegisterBroker />} />
        <Route path="/register-client" element={<RegisterClient />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path='/profile/:username' element={<Profile />} />
        <Route path='/broker/profile/:username' element={<BrokerProfileDetails/>} />
        <Route path="/brokerage-firm" element={<BrokerageFirm />} />
        <Route path="/sell" element={<CreateListing />} />
        <Route path="/buy" element={<Buy/>}/>
        <Route path="/listing/:id" element={<ListingDetails />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}
