import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import APIRoutes from '../utils/APIRoutes';
import { ToastContainer } from 'react-toastify';
import ClientDashboard from './ClientDashboard';
import BrokerDashboard from './BrokerDashboard';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [panel, setPanel] = useState(<div>Dashboard Panel</div>);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    //console.log('User:', user);
    if(!isAuthenticated) {
      navigate('/login');
    }
    if (user?.role) {
      //console.log('Rendering panel for role:', user.role);
      switch (user.role) {
        case 'Client':
          setPanel(<ClientDashboard />);
          break;
        case 'Broker':
          setPanel(<BrokerDashboard />);
          break;
        default:
          setPanel(<div>Dashboard Panel</div>);
      }
    } else {
      setPanel(<div>Dashboard Panel</div>);
    }
  }, [user]);

  return (
    <div className="dashboard">
      {panel}
      <ToastContainer />
    </div>
  );
};

export default Dashboard;