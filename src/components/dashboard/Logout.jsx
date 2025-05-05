import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const Logout = ({ onClose, onNavigateToOverview }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Show success toast
    toast.success('Logged out successfully');
    
    // Redirect to login page
    router.push('/login');
  };

  const handleCancel = () => {
    if (onNavigateToOverview) {
      // Use the provided navigation function to go to overview
      onNavigateToOverview();
    } else if (onClose) {
      // Fallback to closing the modal if no navigation function provided
      onClose();
    } else {
      // Final fallback to going back
      router.back();
    }
  };

  return (
    <div className={logoutContainer}>
      {/* Icon with green border */}
      <div className={logoutIconContainer}>
        <FiLogOut className="text-[#039994]" size={28} />
      </div>

      {/* Title */}
      <h2 className={logoutTitle}>
        Do you wish to leave DCarbon?
      </h2>

      {/* Description */}
      <p className={logoutDescription}>
        You'll need to log in again to access your account
      </p>

      {/* Buttons */}
      <div className={buttonGroup}>
        {/* "Not Yet" button - now navigates to overview */}
        <button
          onClick={handleCancel}
          className={cancelButton}
        >
          Not Yet
        </button>

        {/* "Yes, I do" button */}
        <button
          onClick={handleLogout}
          className={logoutButton}
        >
          Yes, I do
        </button>
      </div>
    </div>
  );
};

// Style constants
const logoutContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white font-sfpro';
const logoutIconContainer = 'flex items-center justify-center w-16 h-16 mb-6 border-2 border-[#039994] rounded-full';
const logoutTitle = 'text-lg font-semibold text-[#1E1E1E] mb-2 font-sfpro';
const logoutDescription = 'text-sm text-[#626060] mb-6 font-sfpro';
const buttonGroup = 'flex flex-col gap-4 w-full max-w-xs px-4';
const cancelButton = 'w-full rounded-md border border-[#039994] text-[#039994] font-semibold py-2 hover:bg-[#03999419] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition';
const logoutButton = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro transition';

export default Logout;