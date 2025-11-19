// frontend/src/pages/Dashboard.jsx (UPDATE)
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import RestaurantDashboard from './restaurant/RestaurantDashboard';
import CustomerDashboard from './customer/CustomerDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Route based on user role
  if (user?.role === 'restaurant') {
    return <RestaurantDashboard />;
  }

  if (user?.role === 'customer') {
    return <CustomerDashboard />;
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome!</h1>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;