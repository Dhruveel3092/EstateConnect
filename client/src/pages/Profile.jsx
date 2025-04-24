import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BrokerProfile from './BrokerProfile';
import ClientProfile from './ClientProfile';
import { showToast } from '../utils/toast';
import APIRoutes from '../utils/APIRoutes';
import { use } from 'react';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        console.log(username);
        const authResponse = await axios.get(APIRoutes.authCheck, { withCredentials: true });
        if (!authResponse.data.user) {
          showToast('Please log in to view the profile', 'error');
          navigate('/login');
          return;
        }
        const user = authResponse.data.user;
        setUserData(user);
        console.log('User data:', user);
      } catch (error) {
        console.error('Profile fetch error:', error);
        showToast('Failed to load profile.', 'error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProfile();
  }, [username, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-gray-500 text-lg">Loading...</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-red-500 text-lg">Unauthorized Access</span>
      </div>
    );
  }

  // Render different profile views based on user role
  switch (userData.role) {
    case 'Broker':
      return <BrokerProfile />;
    case 'Client':
      return <ClientProfile />;
    default:
      return (
        <div className="flex justify-center items-center min-h-screen">
          <span className="text-red-500 text-lg">Unauthorized Access</span>
        </div>
      );
  }
};

export default Profile;
