import React from 'react';
import { useRouter } from 'next/navigation';

export default function EmailVerificationModal({ closeModal }) {
  const router = useRouter();

  const handleNavigate = () => {
    closeModal(); // Close the modal
    // No redirection here to allow loader on the registration modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all">
      <div className="bg-white rounded-lg w-96 p-6 space-y-4 animate__animated animate__fadeIn">
        <h2 className="text-lg font-semibold text-center text-[#039994]">Email invitation sent</h2>
        <p className="text-center text-gray-600">
          An email invitation has been sent to your owner connected to this account.
        </p>

        <hr></hr>
        <div className="flex justify-center mt-6">
          <button
            className="w-full sm:w-auto py-3 px-6 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f] transition duration-300"
            onClick={handleNavigate} // Close this modal but don't redirect
          >
            Complete Registration
          </button>
        </div>
      </div>
    </div>
  );
}
