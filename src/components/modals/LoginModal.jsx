'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../components/loader/Loader';
import toast from 'react-hot-toast';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, redirectPath }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://services.dcarbon.solutions/api/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Store the full response for debugging
      localStorage.setItem('loginResponse', JSON.stringify(response.data));

      const { user, token, requiresTwoFactor, tempToken } = response.data.data;

      // Check if login requires Two Factor Authentication
      if (requiresTwoFactor) {
        // Store the temporary token and any other relevant info for the next step
        localStorage.setItem('tempToken', tempToken);
        localStorage.setItem('userId', user.id);
        toast.success(response.data.message || '2FA verification required');
        window.location.href = '/login/two-factor-authentication';
        return;
      }

      // Otherwise, store user details and token for normal login flow
      localStorage.setItem('userFirstName', user.firstName);
      localStorage.setItem('userProfilePicture', user.profilePicture);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id);

      toast.success('Login successful');
      
      // Call the success handler with user data
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }

      // Close the modal
      onClose();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <Loader />
        </div>
      )}

      {/* Compact Glass-Effect Card Container */}
      <div
        className="w-full max-w-sm space-y-4 p-6 rounded-xl shadow-lg relative"
        style={{
          background: 'linear-gradient(140.06deg, rgba(23, 33, 151, 0.4) -3.08%, rgba(13, 16, 110, 0.4) 106.56%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(31, 31, 141, 0.2)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-8 object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-white text-center mb-3">
          Sign-in to Continue
        </h2>

        {/* Horizontal Line */}
        <hr className="border-t border-gray-300 opacity-30 mb-4" />

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-[#039994] mb-1"
            />
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-xs text-white hover:text-[#039994] transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className="w-full mt-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] transition-colors"
        >
          Sign in
        </button>

        {/* Create Account Link */}
        <p className="text-center text-sm text-white mt-4">
          Don't have an account?{' '}
          <a
            href="/register"
            className="text-[#039994] font-medium hover:text-[#02857f] transition-colors"
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}