import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../../components/loader/Loader'; // Import the loader component

export default function RegistrationSuccessfulModal({ closeModal }) {
  const [isRedirecting, setIsRedirecting] = useState(false); // Local state for loader visibility
  const router = useRouter();

  const handleNavigate = () => {
    closeModal(); // Close the modal
    setIsRedirecting(true); // Show the loader in this component
    setTimeout(() => {
      localStorage.clear();
      router.push('/dashboard'); // Redirect after loader delay
    }, 2000); // Simulate a delay for loader visibility
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg w-96 p-6 space-y-4 animate__animated animate__fadeIn">

        {/* Loader Overlay - Position it directly on top of the modal content */}
        {isRedirecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
            <Loader /> {/* The Loader component */}
          </div>
        )}

        {/* Modal Content */}
        <h2 className="text-lg font-semibold text-center text-[#039994]">Registration Successful</h2>
        <p className="text-center text-gray-600">
          Welcome to DCarbon, Udofot.
        </p>
        <div className="flex justify-center mt-6">
          <button
            className="w-full sm:w-auto py-3 px-6 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f] transition duration-300"
            onClick={handleNavigate} // Trigger loader and redirection
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
