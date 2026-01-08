'use client';

import { useState } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import toast from 'react-hot-toast';

export default function AdminLoginCard() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
  };

  const handleLogin = async () => {
    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password.trim();
    
    if (!normalizedEmail || !trimmedPassword) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const baseUrl = 'https://services.dcarbon.solutions';
      const url = `${baseUrl}/api/auth/admin/login`;

      const response = await axios.post(
        url,
        { 
          email: normalizedEmail, 
          password: trimmedPassword 
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          transformRequest: [(data) => {
            // Ensure email is lowercase in the request body
            if (data && typeof data === 'object') {
              if (data.email) {
                data.email = normalizeEmail(data.email);
              }
            }
            return JSON.stringify(data);
          }]
        }
      );

      localStorage.setItem('loginResponse', JSON.stringify(response.data));

      const { status, message, data } = response.data;
      
      if (status !== 'success') {
        throw new Error(message || 'Login failed');
      }

      const { admin, token } = data;

      if (admin.role !== 'ADMIN') {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', admin.id);
      localStorage.setItem('userFirstName', admin.firstName);
      if (admin.profilePicture) {
        localStorage.setItem('userProfilePicture', admin.profilePicture);
      }
      
      toast.success('Admin login successful');
      window.location.href = '/admin-dashboard';
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-8">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <Loader />
        </div>
      )}

      <div
        className="w-full max-w-md space-y-6 p-8 rounded-xl shadow-lg"
        style={{
          background:
            'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="relative w-full flex flex-col items-center mb-2">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>

        <h2 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#FFFFFF] font-sfpro text-center">
          DCarbon Admin
        </h2>

        <hr className="border-t-2 border-gray-200 mb-4 opacity-70" />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline font-sfpro text-[14px] font-[400]">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#FFFFFF]"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="@ e.g name@domain.com"
              value={email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              onBlur={(e) => {
                const normalized = normalizeEmail(e.target.value);
                setEmail(normalized);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] bg-white bg-opacity-70"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#FFFFFF]"
            >
              Password
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] mb-2 bg-white bg-opacity-70 pr-8"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-[calc(40%+2px)] -translate-y-1/2 text-black"
            >
              {passwordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.03 3.97a.75.75 0 011.06 0l10 10a.75.75 0 11-1.06 1.06l-1.042-1.042A8.74 8.74 0 0110 15c-3.272 0-6.06-1.906-7.76-4.701a.945.945 0 010-1.006 10.45 10.45 0 013.12-3.263L4.03 5.03a.75.75 0 010-1.06zm12.24 7.79c.291-.424.546-.874.76-1.339a.945.945 0 000-1.006C16.06 6.905 13.272 5 10 5c-.638 0-1.26.07-1.856.202l7.127 7.127z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.294 5 12 5c4.706 0 8.268 2.943 9.542 7-1.274 4.057-4.836 7-9.542 7-4.706 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
            <div className="text-right">
              <a
                href="/forgot-password"
                className="font-sfpro font-[600] text-[12px] leading-[100%] tracking-[-0.05em] text-[#FFFFFF] no-underline hover:text-[#02857f]"
              >
                Forgot password
              </a>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition-colors duration-200"
        >
          Sign in
        </button>

        <p className="mt-6 text-center font-sfpro font-[400] text-[14px] leading-[100%] tracking-[-0.05em] text-[#FFFFFF]">
          Don't have an account?{' '}
          <a
            href="/register"
            className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#039994] no-underline hover:text-[#02857f]"
          >
            Create account
          </a>
        </p>

        <hr className="border-t-2 border-gray-200 my-4 opacity-70" />

        <p className="font-sfpro font-[400] text-[10px] leading-[100%] tracking-[-0.05em] text-center text-[#FFFFFF] mb-0">
          By clicking on <strong>Sign in</strong>, you agree to our{' '}
          <a
            href="/terms"
            className="text-[#039994] underline font-[600] hover:text-[#02857f]"
          >
            Terms and Conditions
          </a>{' '}
          &amp;{' '}
          <a
            href="/privacy"
            className="text-[#039994] underline font-[600] hover:text-[#02857f]"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
