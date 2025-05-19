'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPasswordCard() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const inputRefs = useRef([]);
  const [email, setEmail] = useState('');

  // Retrieve email from local storage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('forgotEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Function to handle auto-focus for next OTP input box
  const handleOtpChange = (e, index) => {
    if (/^\d*$/.test(e.target.value)) {
      const newOtpArray = [...otp];
      newOtpArray[index] = e.target.value.slice(-1);
      setOtp(newOtpArray);
      if (e.target.value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace to move focus to previous OTP input box
  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && !e.target.value) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResetPassword = async () => {
    // Combine OTP digits into one number
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error('Please enter a new password (at least 6 characters)');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'https://services.dcarbon.solutions/api/auth/reset-password',
        { email, otp: Number(enteredOtp), password: newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('Password reset successfully');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      {/* Glass-Effect Card */}
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-8 mx-auto mt-10"
        style={{
          background:
            'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>
        {/* Heading */}
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Reset Password
        </h2>
        {/* Description */}
        <p className="text-sm text-white text-center mb-6">
          Enter the 6-digit OTP sent to <strong>{email || 'your email'}</strong> and choose a new password.
        </p>
        {/* OTP Input Boxes */}
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={otp[index]}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="w-12 h-12 text-center bg-transparent border-b-2 border-[#2EBAA0] text-white focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
              placeholder="-"
            />
          ))}
        </div>
        {/* New Password Field */}
        <div className="mb-6">
          <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
          />
        </div>
        {/* Continue Button */}
        <button
          type="button"
          onClick={handleResetPassword}
          className="w-full rounded-lg bg-[#2EBAA0] text-white font-semibold py-2 hover:bg-[#27a48e] focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
        >
          Reset Password
        </button>
        {/* Disclaimer */}
        <p className="mt-6 text-xs text-center text-white leading-tight">
          By clicking Reset Password, you agree to our{' '}
          <a href="/terms" className="text-[#2EBAA0] hover:underline font-medium">
            Terms and Conditions
          </a>{' '}
          &{' '}
          <a href="/privacy" className="text-[#2EBAA0] hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </>
  );
}
