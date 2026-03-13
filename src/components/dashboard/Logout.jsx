import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const Logout = ({ onClose }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleCancel}>
      <div
        className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon with green border */}
        <div className="flex items-center justify-center w-16 h-16 mb-6 border-2 border-[#039994] rounded-full">
          <FiLogOut className="text-[#039994]" size={28} />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-[#1E1E1E] mb-2 font-sfpro">
          Do you wish to leave DCarbon?
        </h2>

        {/* Description */}
        <p className="text-sm text-[#626060] mb-6 font-sfpro">
          You&apos;ll need to log in again to access your account
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs px-4">
          <button
            onClick={handleCancel}
            className="w-full rounded-md border border-[#039994] text-[#039994] font-semibold py-2 hover:bg-[#03999419] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition"
          >
            Not Yet
          </button>

          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition"
          >
            Yes, I do
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
