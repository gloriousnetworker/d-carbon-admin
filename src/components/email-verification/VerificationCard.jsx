'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Loader from '../../components/loader/Loader';
import EmailVerificationModal from '../../components/modals/EmailVerificationModal';
import toast, { Toaster } from 'react-hot-toast';

// Local style constants (from your styles.js)
const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-2';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const progressContainer = 'w-full max-w-md flex items-center justify-between mb-6';
const progressBarWrapper = 'flex-1 h-1 bg-gray-200 rounded-full mr-4';
const progressBarActive = 'h-1 bg-[#039994] w-2/3 rounded-full';
const progressStepText = 'text-sm font-medium text-gray-500 font-sfpro';
const formWrapper = 'w-full max-w-md space-y-6';
const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const buttonPrimary = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
const noteText = 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic';
const termsTextContainer = 'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]';

export default function EmailVerificationCard() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(300);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const otpInputs = useRef([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  // Countdown timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} minute${m !== 1 ? 's' : ''} ${s.toString().padStart(2, '0')} second${s !== 1 ? 's' : ''}`;
  };

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        'https://services.dcarbon.solutions/api/user/verify-otp',
        { email: userEmail, otp: Number(enteredOtp) },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('Email verified successfully');
      setShowModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(userEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'https://services.dcarbon.solutions/api/user/resend-otp',
        { email: userEmail },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('OTP resent successfully');
      localStorage.setItem('userEmail', userEmail);
      setOtp(Array(6).fill(''));
      setTimeLeft(300);
      otpInputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resend OTP failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEditEmail = () => {
    setIsEditingEmail(true);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {loading && (
        <div className={spinnerOverlay}>
          <Loader />
        </div>
      )}

      <div className={mainContainer + ' font-sfpro'}>
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>

        {/* Heading */}
        <div className={headingContainer}>
          <h1 className={pageTitle}>
            Let’s verify your email
          </h1>
        </div>

        {/* Progress Indicator */}
        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            <div className={progressBarActive} />
          </div>
          <span className={progressStepText}>01/05</span>
        </div>

        <p className="text-center text-sm text-gray-600 mb-6 font-sfpro">
          Please enter the 6-digit code sent to your email.
        </p>

        {/* Email input */}
        <div className="w-full max-w-md mb-4">
          <input
            type="text"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            readOnly={!isEditingEmail}
            className={`${inputClass} text-center ${isEditingEmail ? 'bg-white' : 'bg-gray-100'}`}
          />
        </div>

        {/* OTP Inputs */}
        <div className="w-full max-w-md">
          <div className="flex justify-center items-center space-x-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (otpInputs.current[index] = el)}
                className="w-12 h-12 text-center text-xl font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
              />
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center text-sm text-gray-600 mb-6 font-sfpro">
            <span>OTP expires in</span>
            <span className="ml-1 font-semibold text-[#FF0000]">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Resend/Change Email Links */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 mb-6 space-y-2 sm:space-y-0 font-sfpro">
            <button
              type="button"
              className="hover:underline text-left"
              onClick={handleToggleEditEmail}
            >
              Not the correct email? <span className="text-[#039994]">Change email address</span>
            </button>
            <button
              type="button"
              className="hover:underline text-left"
              onClick={handleResendEmail}
            >
              Did not receive an email? <span className="text-[#039994]">Resend email</span>
            </button>
          </div>

          {/* Verify Email Button */}
          <button
            type="button"
            onClick={handleVerifyEmail}
            className={buttonPrimary}
          >
            Verify Email Address
          </button>

          <p className="mt-6 text-center text-sm text-gray-600 font-sfpro">
            Already have an account?{' '}
            <a href="/login" className="text-[#039994] hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {showModal && <EmailVerificationModal closeModal={() => setShowModal(false)} />}
    </>
  );
}
