import React from 'react';
import { useSelector } from 'react-redux';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Show appropriate dashboard based on role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;