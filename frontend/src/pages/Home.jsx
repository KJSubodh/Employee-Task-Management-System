import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';

const Home = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <PageTitle title="Home" />  {/* ← FIXED: was "Employees" */}
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl border border-[#eef2f6] p-8 md:p-12 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0a0a0a] mb-4">
              TaskFlow
            </h1>
            <p className="text-xl text-[#64748b] mb-8">
              Streamline your team's workflow with our powerful task management system
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-[#f1f5f9] rounded-xl">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-semibold text-[#0a0a0a]">Task Management</h3>
                <p className="text-sm text-[#64748b]">Create, assign, and track tasks</p>
              </div>
              <div className="p-6 bg-[#f1f5f9] rounded-xl">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold text-[#0a0a0a]">Team Collaboration</h3>
                <p className="text-sm text-[#64748b]">Work together efficiently</p>
              </div>
              <div className="p-6 bg-[#f1f5f9] rounded-xl">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-[#0a0a0a]">Reports & Analytics</h3>
                <p className="text-sm text-[#64748b]">Track progress and performance</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary px-8 py-3 text-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-secondary px-8 py-3 text-lg"
              >
                Get Started
              </button>
            </div>

            <div className="mt-8 text-sm text-[#94a3b8]">
              Demo Credentials: admin@example.com / Admin@123
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;