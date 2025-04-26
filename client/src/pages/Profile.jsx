import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BrokerProfile from './BrokerProfile';
import ClientProfile from './ClientProfile';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        showToast('Please log in to view the profile', 'error');
        navigate('/login');
      } else if (user?.username !== username) {
        // Redirect to dashboard if the username in params doesn't match the authenticated user
        showToast('Unauthorized Access', 'error');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, loading, navigate, user, username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-gray-500 text-lg">Loading...</span>
      </div>
    );
  }

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