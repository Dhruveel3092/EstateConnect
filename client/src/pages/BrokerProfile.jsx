import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import BrokerDashboardHeader from '../components/BrokerDashboardHeader';
import Footer from '../components/Footer';
import indianCities from '../utils/indianCities';
import { ToastContainer } from 'react-toastify';
import ProfileImageModal from './ProfileImageModal';
import { useAuth } from '../contexts/AuthContext';

const BrokerProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [image, setImage] = useState(null);
  const cities = indianCities;

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
    console.log(name, value);
    if (name === 'location') {
      if (value.trim() === '') {
        setSuggestions([]);
      } else {
        const filtered = cities.filter((city) =>
          city.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
      }
    }
  };

  const handleSuggestionClick = (city) => {
    setFormData((prev) => ({
      ...prev,
      location: city,
    }));
    // console.log(formData);
    setSuggestions([]);
  };

  const validateFormData = () => {
    console.log(formData);
    if (!formData.location && !(formData.location==='') && !cities.includes(formData.location.trim())) {
      showToast('Location is required and must be selected from suggestions.', 'error');
      return false;
    }
    console.log('Contact Number:', formData.contactNumber);
    if (!(formData.contactNumber === null) && !(formData.contactNumber === '') && !/^\d{10}$/.test(formData.contactNumber)) {
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

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  const uploadFile = async (type, timestamp, signature) => {
    const data = new FormData();
    data.append("file", image);
    data.append("timestamp", timestamp);
    data.append("signature", signature);
    data.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const resourceType = type;
      const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const res = await axios.post(api, data);
      const { secure_url } = res.data;
      return secure_url;
    } catch (error) {
      console.log(error);
    }
  }

  const getSignatureForUpload = async () => {
    try {
      const res = await axios.get(APIRoutes.getSignature, { withCredentials: true });
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }

  const handleUpload = async () => {
    try {
      const { timestamp: imgTimestamp, signature: imgSignature } = await getSignatureForUpload();
      const fileUrl = await uploadFile('image', imgTimestamp, imgSignature);
      // console.log(imgUrl);
      const response = await axios.post(APIRoutes.uploadProfileImage, { profilePicture: fileUrl }, { withCredentials: true });
      if (response.data.success) {
        showToast(response.data.message, "success");
        setProfileData({ ...profileData, profilePicture: fileUrl });
        setUser({ ...user, profilePicture: fileUrl });
      } else {
        showToast(response.data.message, "error");
      }
      setImage(null);
    } catch (error) {
      showToast(error.data.message, "error");
      console.error('Error updating notice', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <BrokerDashboardHeader />
      <ProfileImageModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        handleImageChange={handleImageChange}
        handleUpload={handleUpload}
        setImage={setImage}
        image={image}
      />
      <div className="bg-gray-100 min-h-screen py-12 px-6">
        <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-lg">
          <img
            src={profileData.profilePicture}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-300"
            onClick={() => setModalOpen(true)}
          />
          <h2 className="text-2xl font-semibold text-center">{profileData.username}</h2>

          <form className="space-y-6">
            {/* Company Name */}

            <div>
              <label className="block text-gray-600 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                readOnly={true}
                className={`w-full p-3 border rounded-md focus:outline-none bg-gray-100`}
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="text"
                name="companyName"
                value={formData.email || ''}
                readOnly={true}
                className={`w-full p-3 border rounded-md focus:outline-none bg-gray-100`}
              />
            </div>
            {/* License Number */}
            <div>
              <label className="block text-gray-600 mb-1">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber || ''}
                readOnly={true}
                className={`w-full p-3 border rounded-md focus:outline-none bg-gray-100`}
              />
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-gray-600 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder={formData.location ? formData.location : "Not specified"}
                className={`w-full p-3 border rounded-md focus:outline-none ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
                autoComplete="off"
              />
              {isEditing && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto">
                  {suggestions.map((city, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(city)}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-gray-600 mb-1">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder={formData.contactNumber ? formData.contactNumber : "Not specified"}
                className={`w-full p-3 border rounded-md focus:outline-none ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
              />
            </div>

            {/* Commission Percentage */}
            <div>
              <label className="block text-gray-600 mb-1">Brokerage (%)</label>
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
                  Edit Details
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
      <ToastContainer />
    </>
  );
};

export default BrokerProfile;
