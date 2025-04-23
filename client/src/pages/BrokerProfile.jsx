import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import BrokerDashboardHeader from '../components/BrokerDashboardHeader';
import Footer from '../components/Footer';

const BrokerProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(APIRoutes.getBrokerProfile, { withCredentials: true });
        if (data.role !== 'Broker') {
          showToast('Unauthorized Access', 'error');
          navigate('/dashboard');
          return;
        }
        setProfileData(data);
        setFormData(data);
      } catch (error) {
        console.error('Profile fetch error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFormData = () => {
    if (!formData.companyName || formData.companyName.trim() === '') {
      showToast('Company Name is required.', 'error');
      return false;
    }
    if (!formData.licenseNumber || formData.licenseNumber.trim() === '') {
      showToast('License Number is required.', 'error');
      return false;
    }
    if (!formData.location || formData.location.trim() === '') {
      showToast('Location is required.', 'error');
      return false;
    }
    if (!formData.contactNumber || !/^\d{10}$/.test(formData.contactNumber)) {
      showToast('Contact Number must be a valid 10-digit number.', 'error');
      return false;
    }
    if (
      formData.commissionPercentage === undefined ||
      formData.commissionPercentage === null ||
      isNaN(formData.commissionPercentage) ||
      formData.commissionPercentage < 0 ||
      formData.commissionPercentage > 100
    ) {
      showToast('Commission Percentage must be between 0 and 100.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateFormData()) {
      return;
    }

    try {
      const { data } = await axios.put(APIRoutes.updateBrokerProfile, formData, { withCredentials: true });
      setProfileData(data);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save changes.', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <BrokerDashboardHeader />

      <div className="bg-gray-100 min-h-screen py-12 px-6">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
            Broker Profile
          </h1>

          <form className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-gray-600 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full p-3 border rounded-md focus:outline-none ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
              />
            </div>

            {/* License Number */}
            <div>
              <label className="block text-gray-600 mb-1">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full p-3 border rounded-md focus:outline-none ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-600 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full p-3 border rounded-md focus:outline-none ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-gray-600 mb-1">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`w-full p-3 border rounded-md focus:outline-none ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
              />
            </div>

            {/* Commission Percentage */}
            <div>
              <label className="block text-gray-600 mb-1">Commission Percentage (%)</label>
              <input
                type="number"
                name="commissionPercentage"
                value={formData.commissionPercentage || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                min="0"
                max="100"
                className={`w-full p-3 border rounded-md focus:outline-none ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6 mt-10">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(profileData);
                    }}
                    className="px-6 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Back to Dashboard */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BrokerProfile;
