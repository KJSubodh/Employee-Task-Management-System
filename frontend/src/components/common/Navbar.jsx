import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBell, 
  FaSignOutAlt,
  FaSearch,
  FaUserCircle,
  FaBars
} from 'react-icons/fa';
import { logoutUser } from '../../store/slices/authSlice';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/tasks': 'Tasks',
  '/reports': 'Reports',
};

const Navbar = ({ sidebarOpen, setSidebarOpen, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    // NOTE: lg:left-64 matches the sidebar width so the navbar spans only
    // the content area on desktop, aligning with main content's lg:pl-64.
    <header className="fixed top-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-sm border-b border-[#eef2f6] z-40 h-14">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section — dynamic page title, no duplicate logo */}
        <div className="flex items-center min-w-0">
          <h1 className="text-sm font-semibold text-[#0a0a0a] tracking-tight truncate">
            {pageTitle}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Search */}
          <div className="hidden md:block relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-sm" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 pl-8 pr-3 py-1.5 text-sm bg-[#f8fafc] border border-[#eef2f6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]/20 focus:bg-white transition-all duration-200 placeholder:text-[#94a3b8]"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-[#f1f5f9] transition-colors relative"
              aria-label="Notifications"
            >
              <FaBell className="text-[#475569] text-lg" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#dc2626] rounded-full border-2 border-white"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-[#eef2f6] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50">
                <div className="p-3 border-b border-[#eef2f6]">
                  <h3 className="text-sm font-semibold text-[#0a0a0a]">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto p-4 text-center">
                  <p className="text-sm text-[#64748b]">No notifications</p>
                  <p className="text-xs text-[#94a3b8] mt-1">All caught up!</p>
                </div>
                <div className="p-2 border-t border-[#eef2f6]">
                  <button className="w-full text-center text-xs text-[#64748b] hover:text-[#0a0a0a] font-medium py-1 transition-colors">
                    View all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#f1f5f9] transition-colors"
              aria-label="User menu"
            >
              <div className="w-7 h-7 bg-[#e2e8f0] rounded-full flex items-center justify-center text-[#475569] text-xs font-medium">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="hidden lg:block text-sm text-[#1a1a1a] font-medium">
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#eef2f6] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50">
                <div className="p-3 border-b border-[#eef2f6]">
                  <p className="text-sm font-medium text-[#0a0a0a] truncate">{user?.fullName}</p>
                  <p className="text-xs text-[#64748b] truncate">{user?.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    user?.role === 'admin' 
                      ? 'bg-[#f1f5f9] text-[#475569]' 
                      : 'bg-[#f8fafc] text-[#64748b]'
                  }`}>
                    {user?.role || 'Employee'}
                  </span>
                </div>
                <div className="p-1">
                  <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#1a1a1a] hover:bg-[#f1f5f9] transition-colors">
                    <FaUserCircle className="text-[#94a3b8] text-sm" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
                  >
                    <FaSignOutAlt className="text-sm" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only, now on the right, after all other controls */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#f1f5f9] transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <FaBars className="text-[#475569] text-lg" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;