'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// Local style constants (adapted from your styles.js)
const modalContainer =
  'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all';
const modalCard =
  'rounded-lg w-96 p-6 space-y-4';
const modalTitle =
  'text-lg font-semibold text-center text-[#039994] font-sfpro';
const modalParagraph =
  'text-center text-sm text-gray-600'; // Using gray-600 as provided (#4B5563)
const modalButton =
  'w-full sm:w-auto py-3 px-6 rounded-md text-white font-semibold transition duration-300 bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';

export default function EmailVerificationModal({ closeModal }) {
  const router = useRouter();

  const handleNavigate = () => {
    closeModal();
    router.push('/login');
  };

  return (
    <div className={modalContainer}>
      <div className={modalCard} style={{ backgroundColor: 'white', fontFamily: 'SF Pro Display, sans-serif' }}>
        {/* Space for vector image */}
        <div className="flex justify-center">
          <img src="/vectors/EmailVector.png" alt="Vector Graphic" className="w-16 h-16" />
        </div>
        <h2 className={modalTitle}>
          Email verified
        </h2>
        <p
          className={modalParagraph}
          style={{
            color: '#4B5563',
            fontSize: '14px',
            lineHeight: '20px',
            fontFamily: 'SF Pro Display, sans-serif',
          }}
        >
          Your email has been verified. Please continue to create an account with us.
        </p>
        <div className="flex justify-center mt-6">
          <button
            className={modalButton}
            onClick={handleNavigate}
          >
            Continue to Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
