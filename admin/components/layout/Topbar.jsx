'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, User, KeyRound, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Topbar() {
  const router = useRouter();
  const { admin, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200
      px-6 flex items-center justify-between sticky top-0 z-10">

      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <input
            placeholder="Search Here"
            className="w-full pl-4 pr-4 py-2 text-sm border border-gray-200
              rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
              bg-gray-50"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 ml-4">
        {/* Bell */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
          <Bell className="w-5 h-5 text-gray-500" />
        </button>

        {/* Admin Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50
              rounded-lg p-1.5 transition"
          >
            <div className="w-9 h-9 rounded-full bg-gray-300
              flex items-center justify-center overflow-hidden">
              {admin?.profile_image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${admin.profile_image}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {admin?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform
              ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48
              bg-white border border-gray-200 rounded-xl shadow-lg
              overflow-hidden z-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-3
                  text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/reset-password');
                }}
                className="w-full flex items-center gap-3 px-4 py-3
                  text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <KeyRound className="w-4 h-4" />
                Reset Password
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3
                  text-sm text-red-500 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}