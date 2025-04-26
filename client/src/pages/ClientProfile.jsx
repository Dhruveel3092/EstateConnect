import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import indianCities from '../utils/indianCities';
import { ToastContainer } from 'react-toastify';
import ProfileImageModal from './ProfileImageModal';
import { useAuth } from '../contexts/AuthContext';

const ClientProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [image, setImage] = useState(null);
  const cities = indianCities;

  // Fetch client profile
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        showToast('Please log in to access your profile', 'error');
        navigate('/login');
      } else {
        const fetchProfile = async () => {
          try {
            const { data } = await axios.get(APIRoutes.getClientProfile, { withCredentials: true });
            if (data.role !== 'Client') {
              showToast('Unauthorized Access', 'error');
              navigate('/dashboard');
              return;
            }
            setProfileData(data);
            setFormData(data);
          } catch (error) {
            console.error('Profile fetch error:', error);
            navigate('/login');
          }
        };

        fetchProfile();
      }
    }
  }, [isAuthenticated, loading, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

  // Handle suggestion click
  const handleSuggestionClick = (city) => {
    setFormData((prev) => ({
      ...prev,
      location: city,
    }));
    setSuggestions([]);
  };

  // Validate form data
  const validateFormData = () => {
    if (!formData.location || !cities.includes(formData.location.trim())) {
      showToast('Location is required and must be selected from suggestions.', 'error');
      return false;
    }
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      showToast('Contact Number must be a valid 10-digit number.', 'error');
      return false;
    }
    return true;
  };

  // Save profile changes
  const handleSave = async () => {
    if (!validateFormData()) return;

    try {
      const { data } = await axios.put(APIRoutes.updateClientProfile, formData, { withCredentials: true });
      setProfileData(data);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save changes.', 'error');
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  const uploadFile = async (type, timestamp, signature) => {
    const data = new FormData();
    data.append('file', image);
    data.append('timestamp', timestamp);
    data.append('signature', signature);
    data.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const resourceType = type;
      const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const res = await axios.post(api, data);
      const { secure_url } = res.data;
      return secure_url;
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const getSignatureForUpload = async () => {
    try {
      const res = await axios.get(APIRoutes.getSignature, { withCredentials: true });
      return res.data;
    } catch (error) {
      console.error('Error fetching signature:', error);
    }
  };

  const handleUpload = async () => {
    try {
      const { timestamp: imgTimestamp, signature: imgSignature } = await getSignatureForUpload();
      const fileUrl = await uploadFile('image', imgTimestamp, imgSignature);
      // console.log(imgUrl);
      const response = await axios.post(APIRoutes.uploadProfileImage, { profilePicture: fileUrl }, { withCredentials: true });
      if (response.data.success) {
        showToast(response.data.message, 'success');
        setProfileData({ ...profileData, profilePicture: fileUrl });
      } else {
        showToast(response.data.message, 'error');
      }
      setImage(null);
    } catch (error) {
      showToast('Failed to upload image.', 'error');
      console.error('Image upload error:', error);
    }
  };

  if (loading || !profileData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <ClientDashboardHeader />
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
            src={profileData.profilePicture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-300 cursor-pointer"
            onClick={() => setModalOpen(true)}
          />
          <h2 className="text-2xl font-semibold text-center">{profileData.username}</h2>

          <form className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="text"
                name="email"
                value={formData.email || ''}
                readOnly
                className="w-full p-3 border rounded-md bg-gray-100"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-gray-600 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
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

export default ClientProfile;