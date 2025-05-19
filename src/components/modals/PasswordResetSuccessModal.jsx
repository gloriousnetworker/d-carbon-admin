import React, { useState } from 'react';
import Loader from '../../components/loader/Loader'; 
import { useRouter } from 'next/navigation';

export default function PasswordResetSuccessModal({ closeModal, loading }) {
  const [isRedirecting, setIsRedirecting] = useState(false); // Manage the redirect state
  const router = useRouter();

  const handleNavigate = () => {
    setIsRedirecting(true); // Trigger the loader
    setTimeout(() => {
      closeModal(); // Close the modal after a delay
      router.push('/login'); // Redirect to login page after the delay
    }, 2000); // Add delay for the loader effect
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-96 p-6 space-y-4">
        {/* Loader displayed on top of modal */}
        {isRedirecting && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
            <Loader />
          </div>
        )}

        {/* Modal Content */}
        <h2 className="text-lg font-semibold text-center text-[#039994]">Password changed</h2>
        <p className="text-center text-gray-600">
          Your password has been successfully changed. You can now login to your dashboard.
        </p>

        {/* Display "Continue to Login Page" button */}
        {!isRedirecting && (
          <div className="flex justify-center mt-6">
            <button
              className="w-full sm:w-auto py-3 px-6 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f] transition duration-300"
              onClick={handleNavigate}
            >
              Continue to Login Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
