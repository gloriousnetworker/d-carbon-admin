'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailModal({ closeModal }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'name@gmail.com';
    setUserEmail(email);
  }, []);

  const handleNavigate = () => {
    closeModal();
    router.push('/register/email-verification');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-96 p-16 space-y-4">
        {/* Email Vector positioned at the top-center */}
        <img
          src="/vectors/email_vector.png"
          alt="Email verification icon"
          style={{ width: '48px', height: '48px', position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)' }}
        />
        {/* Email Verification Text */}
        <h2 style={{ fontFamily: 'SF Pro Text, sans-serif', fontWeight: 600, fontSize: '24px', lineHeight: '100%', letterSpacing: '-5%', textAlign: 'center', color: '#039994', marginTop: '16px' }}>
          Email Verification
        </h2>
        {/* Message text with user's email */}
        <p style={{ fontFamily: 'SF Pro Text, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '100%', letterSpacing: '-5%', textAlign: 'center', color: '#1E1E1E' }}>
          We've sent an email with a 6-digit OTP to your email, <span style={{ fontFamily: 'SF Pro Text, sans-serif', fontWeight: 800, fontSize: '14px', lineHeight: '100%', letterSpacing: '-5%', textAlign: 'center', color: '#1E1E1E' }}>
            {userEmail}
          </span> to verify your account.
        </p>

        <hr className="border border-gray-300" />
        {/* Verify Email Button */}
        <button onClick={handleNavigate} style={{ fontFamily: 'SF Pro Text, sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '100%', letterSpacing: '-5%', width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#039994', color: '#FFFFFF', cursor: 'pointer', border: 'none', marginTop: '12px' }}>
          Verify your Email
        </button>
        {/* Already have an account? Sign in */}
        <p style={{ fontFamily: 'SF Pro Text, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '100%', letterSpacing: '-5%', textAlign: 'center', color: '#1E1E1E', marginTop: '12px' }}>
          Already have an account?{' '}
          <a
            href="/login"
            style={{ fontFamily: 'SF Pro Text, sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '100%', letterSpacing: '-5%', textDecoration: 'underline', color: '#039994' }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
