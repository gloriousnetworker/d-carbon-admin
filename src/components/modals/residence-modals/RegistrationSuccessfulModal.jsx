import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../../../components/loader/Loader';
import Image from 'next/image';

export default function RegistrationSuccessfulModal({ closeModal }) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  
  // Get user's first name from local storage
  const userFirstName = typeof window !== 'undefined' ? localStorage.getItem('userFirstName') : '';

  const handleNavigate = () => {
    closeModal();
    setIsRedirecting(true);
    setTimeout(() => {
      router.push('/residence-dashboard');
    }, 2000);
  };

  return (
    <div className={spinnerOverlay}>
      <div className={`relative bg-white rounded-md shadow-md p-6 space-y-6 w-full max-w-md ${modalContent}`}>
        {/* Loader Overlay */}
        {isRedirecting && (
          <div className={loaderOverlay}>
            <Loader />
          </div>
        )}

        {/* Registration Success Icon */}
        <div className="flex justify-center">
          <Image 
            src="/vectors/RegSuccessVector.png" // Replace with your actual image path
            alt="Registration successful"
            width={80}
            height={80}
            className="mb-4"
          />
        </div>

        {/* Heading */}
        <h2 className={modalHeading}>
          Registration Successful
        </h2>

        {/* Welcome Message */}
        <p className={welcomeMessage}>
          Welcome to DCarbon, <span className={userNameStyle}>{userFirstName || 'User'}</span>
        </p>

        {/* Button */}
        <div className="flex justify-center">
          <button
            className={buttonPrimary}
            onClick={handleNavigate}
            disabled={isRedirecting}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Style constants
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-sfpro';
const modalContent = 'animate__animated animate__fadeIn';
const loaderOverlay = 'absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-md z-10';
const modalHeading = 'text-2xl font-semibold text-[#039994] text-center font-sfpro';
const welcomeMessage = 'text-center font-sfpro text-[16px] leading-[140%] text-[#1E1E1E]';
const userNameStyle = 'text-[#039994] font-medium';
const buttonPrimary = 'w-full sm:w-auto py-2 px-6 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition duration-300 disabled:opacity-50';