import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BrokerProfile from './BrokerProfile';
import ClientProfile from './ClientProfile';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated} = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please log in to view the profile', 'error');
      navigate('/login');
    }
  }, [ isAuthenticated, navigate]);



  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-red-500 text-lg">Unauthorized Access</span>
      </div>
    );
  }

  switch (user.role) {
    case 'Broker':
      return <BrokerProfile />;
    case 'Client':
      return <ClientProfile />;
    default:
      return (
        <div className="flex justify-center items-center min-h-screen">
          <span className="text-red-500 text-lg">Unauthorized Role</span>
        </div>
      );
  }
};

export default Profile;
