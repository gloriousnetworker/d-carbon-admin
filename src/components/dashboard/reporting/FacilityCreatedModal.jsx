import React from "react";
import { FiX } from "react-icons/fi";

export default function FacilityCreatedModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-md shadow-lg p-6 relative">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-semibold text-[#039994] mb-4">
          New Facility Created
        </h2>
        <p className="text-sm text-gray-700 mb-6">
          Your new commercial facility has been successfully created!
        </p>

        <button
          onClick={onClose}
          className="w-full bg-[#039994] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#028c8c]"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
