import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import { useAuth } from '../contexts/AuthContext';
import ClientDashboardHeader from '../components/ClientDashboardHeader';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import indianCities from '../utils/indianCities';
import BrokerModal from '../components/BrokerModal';

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    brokerIds: [],
    name: '',
    description: '',
    address: '',
    location: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    startPrice: null,
    visitingDate: '',
    startTime: '',
    endTime: '',
    parking: false,
    furnished: false,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [imageUploadError, setImageUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [brokerSelectorVisible, setBrokerSelectorVisible] = useState(false);
  const [selectedBrokers, setSelectedBrokers] = useState([]);
  const [brokerSearch, setBrokerSearch] = useState('');
  const [brokerList, setBrokerList] = useState([]);

  useEffect(() => {
    // if (brokerSelectorVisible && brokerList.length === 0) {
      fetchBrokers();
    // }
  }, [brokerSelectorVisible]);

  const fetchBrokers = async () => {
    try {
      const { data } = await axios.get(APIRoutes.getAllBrokers, { withCredentials: true });
      setBrokerList(data.brokers);
      console.log(data.brokers);
    } catch (err) {
      console.error('Failed to fetch brokers:', err);
    }
  };

  const handleBrokerSelect = (broker) => {
    const alreadySelected = selectedBrokers.find(b => b._id === broker._id);
    if (alreadySelected) {
      setSelectedBrokers(prev => prev.filter(b => b._id !== broker._id));
    } else {
      setSelectedBrokers(prev => [...prev, broker]);
    }
  };

  const toggleBrokerSelector = () => {
    setBrokerSelectorVisible((prev) => !prev);
  };

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
      setUploading(true);
      setImageUploadError('');
      const promises = files.map((file) => uploadImage(file));
      try {
        const urls = await Promise.all(promises);
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...urls],
        }));
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploading(false);
      } catch (err) {
        setImageUploadError('Image upload failed. Please try again.');
        setUploading(false);
      }
    } else {
      setImageUploadError('You can only upload up to 6 images.');
    }
  };

  const uploadImage = async (file) => {
    const data = new FormData();
    data.append('file', file);
    const { timestamp, signature } = await getSignatureForUpload();
    data.append('timestamp', timestamp);
    data.append('signature', signature);
    data.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const api = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const res = await axios.post(api, data);
      return res.data.secure_url;
    } catch (error) {
      throw new Error('Image upload failed.');
    }
  };

  const getSignatureForUpload = async () => {
    try {
      const { data } = await axios.get(APIRoutes.getSignature, { withCredentials: true });
      return data;
    } catch (error) {
      throw new Error('Failed to fetch upload signature.');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [id]: checked,
      }));
    } else if (id !== 'location') {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleLocationChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (value.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = indianCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleSuggestionClick = (city) => {
    setFormData((prev) => ({
      ...prev,
      location: city,
    }));
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.imageUrls.length < 1) {
      setError('You must upload at least one image.');
      return;
    }
    
    if (!formData.location || !indianCities.includes(formData.location.trim())) {
      setError('Location is required and must be selected from suggestions.');
      return;
    }

    if (selectedBrokers.length < 1) {
      setError('You must select at least one broker.');
      return;
    }
    
    if (formData.visitingDate.trim() !== '') {
      if (!formData.startTime || !formData.endTime) {
        setError('Start time and End time are required if Visiting Date is provided.');
        return;
      }
      if (formData.startTime >= formData.endTime) {
        setError('Start time must be earlier than End time.');
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      if (formData.visitingDate < today) {
        setError('Visiting date must be today or later.');
        return;
      }
    }
    
    if (formData.imageUrls.length > 6) {
      setError('You can only upload up to 6 images.');
      return;
    }
    
    const brokerIds = selectedBrokers.map((broker) => broker._id);
    const payload = { ...formData, brokerIds };

    setLoading(true);
    try {
      const { data } = await axios.post(
        APIRoutes.createListing,
        payload,
        { withCredentials: true }
      );
      setLoading(false);
      if (data.success) {
        showToast('Listing created successfully!', 'success');
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to create listing.');
      setLoading(false);
    }
  };

  return (
    <>
      <ClientDashboardHeader />
      <main className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-2xl mt-10 transition-all duration-500">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10 border-b pb-4">
          Create a Listing
        </h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input 
              type="text"
              id="name"
              placeholder="Property Name"
              required
              className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={handleChange} 
              value={formData.name} 
            />
            <input 
              type="text"
              id="address"
              placeholder="Property Address"
              required
              className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={handleChange} 
              value={formData.address} 
            />
          </div>
          <div className="relative">
            <input 
              type="text"
              id="location"
              placeholder="Location"
              required
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={handleLocationChange} 
              value={formData.location || ''}
            />
            {suggestions.length > 0 && (
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
          <textarea 
            id="description"
            placeholder="Property Description"
            required 
            rows="4"
            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={handleChange} 
            value={formData.description} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-700">Details</h2>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    id="bedrooms"
                    min="1"
                    max="10"
                    required 
                    placeholder="Enter number"
                    className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-1/2"
                    onChange={handleChange} 
                    value={formData.bedrooms || ''}
                  />
                  <span className="text-gray-700 font-medium">Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    id="bathrooms"
                    min="1"
                    max="10"
                    required 
                    placeholder="Enter number"
                    className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-1/2"
                    onChange={handleChange} 
                    value={formData.bathrooms || ''}
                  />
                  <span className="text-gray-700 font-medium">Bathrooms</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="number"
                  id="startPrice"
                  min="50"
                  max="10000000"
                  required 
                  placeholder="Enter price"
                  className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onChange={handleChange} 
                  value={formData.startPrice || ''}
                />
                <span className="text-gray-700 font-medium">Start Price</span>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-700">Options</h2>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="parking" 
                    checked={formData.parking} 
                    onChange={handleChange} 
                    className="h-5 w-5"
                  />
                  <span>Parking</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="furnished" 
                    checked={formData.furnished} 
                    onChange={handleChange} 
                    className="h-5 w-5"
                  />
                  <span>Furnished</span>
                </label>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'sale' }))}
                  className={`px-6 py-2 rounded-full border transition-colors ${
                    formData.type==='sale'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Sell
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'rent' }))}
                  className={`px-6 py-2 rounded-full border transition-colors ${
                    formData.type==='rent'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Rent
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Visiting Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label htmlFor="visitingDate" className="text-gray-700 font-medium mb-2">
                  Visiting Date
                </label>
                <input
                  type="date"
                  id="visitingDate"
                  required
                  className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onChange={handleChange}
                  value={formData.visitingDate || ''}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="startTime" className="text-gray-700 font-medium mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  required
                  className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onChange={handleChange}
                  value={formData.startTime || ''}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endTime" className="text-gray-700 font-medium mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  required
                  className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onChange={handleChange}
                  value={formData.endTime || ''}
                />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Images (Max 6)</h2>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input 
                type="file"
                id="images"
                accept="image/*"
                multiple 
                ref={fileInputRef}
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="p-4 border border-gray-300 rounded-lg"
              />
              <button 
                type="button"
                onClick={handleImageSubmit}
                disabled={uploading}
                className="px-6 py-3 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
              </button>
            </div>
            {imageUploadError && <p className="text-red-500 text-sm">{imageUploadError}</p>}
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt="Uploaded" className="w-full h-32 object-cover rounded-lg shadow-md" />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Broker Selection</h2>
            <div className="flex flex-col gap-4">
              {selectedBrokers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedBrokers.map((broker) => (
                    <span key={broker._id} className="px-3 py-1 bg-green-200 text-green-800 rounded-full flex items-center">
                      {broker.username}
                      <button 
                        type="button" 
                        onClick={() => handleBrokerSelect(broker)}
                        className="ml-2 text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button 
                type="button"
                onClick={toggleBrokerSelector}
                className="w-48 px-6 py-3 rounded-full bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
              >
                Choose Broker
              </button>
              {brokerSelectorVisible && (
                <BrokerModal
                  brokerList={brokerList}
                  brokerSearch={brokerSearch}
                  setBrokerSearch={setBrokerSearch}
                  selectedBrokers={selectedBrokers}
                  handleBrokerSelect={handleBrokerSelect}
                  onClose={() => {
                    setBrokerSelectorVisible(false);
                    setSelectedBrokers([]);
                  }}
                  isOpen={brokerSelectorVisible}
                  onConfirm={() => {
                    setBrokerSelectorVisible(false);
                  }
                }
                />
              )}
            </div>
          </div>
          {error && <p className="text-center text-red-600 font-semibold">{error}</p>}
          <div className="flex justify-center">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-48 px-8 py-4 rounded-full bg-green-600 text-white font-bold shadow hover:bg-green-700 transition"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default CreateListing;