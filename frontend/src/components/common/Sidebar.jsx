import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaTasks, 
  FaFileAlt, 
  FaTimes,
  FaSignOutAlt,
  FaCog
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice';

const Sidebar = ({ sidebarOpen, setSidebarOpen, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    ...(user?.role === 'admin' ? [{ path: '/employees', icon: FaUsers, label: 'Employees' }] : []),
    { path: '/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/reports', icon: FaFileAlt, label: 'Reports' }
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0a0a0a]/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/*
        Desktop: pinned to the left (left-0, translate-x-0 via lg:).
        Mobile: pinned to the RIGHT (right-0) and slides in from the right
        using translate-x-full <-> translate-x-0, instead of the old
        left-0 / -translate-x-full pattern.
      */}
      <aside
        className={`fixed top-0 right-0 lg:right-auto lg:left-0 h-full bg-white border-l lg:border-l-0 lg:border-r border-[#eef2f6] z-50 w-64 transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[#eef2f6]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px] tracking-tight">TF</span>
            </div>
            <span className="text-sm font-semibold text-[#0a0a0a] tracking-tight">TaskFlow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-[#f1f5f9] transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <FaTimes className="text-[#64748b] text-sm" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-0.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#f1f5f9] text-[#0a0a0a] font-medium'
                    : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0a0a0a]'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`text-base w-4 ${isActive ? 'text-[#0a0a0a]' : 'text-[#94a3b8]'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#eef2f6] bg-[#fafcfc]">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-[#eef2f6] mb-2">
            <div className="w-8 h-8 bg-[#e2e8f0] rounded-full flex items-center justify-center text-[#475569] text-xs font-medium">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0a0a0a] truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-[#64748b] truncate">{user?.email || ''}</p>
            </div>
            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
              user?.role === 'admin' 
                ? 'bg-[#f1f5f9] text-[#475569]' 
                : 'bg-[#f8fafc] text-[#64748b]'
            }`}>
              {user?.role || 'Employee'}
            </span>
          </div>
          
          <div className="space-y-0.5">
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0a0a0a] transition-colors">
              <FaCog className="text-sm w-4" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
            >
              <FaSignOutAlt className="text-sm w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;