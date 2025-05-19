import React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function EmailVerificationModal({ closeModal }) {
  const router = useRouter();

  const handleNavigate = () => {
    toast.success('Registration completed successfully!');
    closeModal();
  };

  return (
    <div className={spinnerOverlay}>
      <div className={`relative w-full max-w-md bg-white rounded-md shadow-md p-6 space-y-6 ${modalContent}`}>
        {/* Email Sent Icon */}
        <div className="flex justify-center">
          <Image 
            src="/vectors/EmailVector.png" // Replace with your actual image path
            alt="Email sent"
            width={80}
            height={80}
            className="mb-4"
          />
        </div>
        
        {/* Heading */}
        <h2 className={modalHeading}>
          Email Invitation Sent
        </h2>
        
        {/* Message */}
        <p className={modalMessage}>
          An email invitation has been sent to your owner connected to this account.
        </p>
        
        <hr className={dividerStyle} />
        
        {/* Button */}
        <div className="flex justify-center">
          <button
            className={buttonPrimary}
            onClick={handleNavigate}
          >
            Complete Registration
          </button>
        </div>
      </div>
    </div>
  );
}

// Style constants (extracted from your styles.js)
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-sfpro';
const modalContent = 'animate__animated animate__fadeIn';
const modalHeading = 'text-2xl font-semibold text-[#039994] text-center font-sfpro';
const modalMessage = 'text-center text-gray-600 font-sfpro text-[14px] leading-[140%]';
const dividerStyle = 'border-t border-gray-200 my-4';
const buttonPrimary = 'w-full sm:w-auto py-2 px-6 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition duration-300';