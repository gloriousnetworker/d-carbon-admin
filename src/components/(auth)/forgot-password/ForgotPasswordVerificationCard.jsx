'use client';

import { useState } from 'react';
import axios from 'axios';
import Loader from '../../../components/loader/Loader';
import toast, { Toaster } from 'react-hot-toast';

// Styles (moved from styles.js)
const styles = {
  pageTitle:
    'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#FFFFFF] font-sfpro text-center',
  labelClass:
    'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#FFFFFF]',
  inputClass:
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#FFFFFF]',
  buttonPrimary:
    'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  termsTextContainer:
    'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#FFFFFF]',
  formWrapper: 'w-full max-w-md space-y-6',
};

export default function ForgotPasswordCard() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        'https://services.dcarbon.solutions/api/auth/forgot-password',
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('An OTP verification code has been sent to your email');
      localStorage.setItem('forgotEmail', email);
      setTimeout(() => {
        window.location.href = '/reset-password';
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      {/* Card Container */}
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-8 mx-auto mt-10"
        style={{
          background:
            'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <div className={styles.formWrapper}>
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/auth_images/Login_logo.png"
              alt="DCarbon Logo"
              className="h-10 object-contain"
            />
          </div>

          {/* Heading */}
          <h2 className={styles.pageTitle}>Forgot Password</h2>

          {/* Description */}
          <p className="text-center text-sm text-white font-sfpro mb-4">
            Please enter your email address. A reset OTP will be sent to your email.
          </p>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className={styles.labelClass}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.inputClass} bg-transparent placeholder-gray-300 text-white`}
            />
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleForgotPassword}
            className={styles.buttonPrimary}
          >
            Continue
          </button>

          <hr />

          {/* Terms & Conditions */}
          <p className={styles.termsTextContainer}>
            By clicking continue, you agree to our{' '}
            <a href="/terms" className="text-[#039994] hover:underline">
              Terms and Conditions
            </a>{' '}
            &{' '}
            <a href="/privacy" className="text-[#039994] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
