"use client";

import React, { useState } from 'react';

const DashboardNotifications = () => {
  // Style constants
  const mainContainer = 'bg-white p-6 rounded-lg shadow w-full';
  const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';

  // Toggle switch base styles
  const toggleButtonBase = 'relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2';
  const toggleHandleBase = 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform';

  // Local toggle state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [onScreenNotifications, setOnScreenNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  // Handlers no longer fire toast, just flip the boolean
  const handleToggleEmail = () => {
    setEmailNotifications((prev) => !prev);
  };

  const handleToggleOnScreen = () => {
    setOnScreenNotifications((prev) => !prev);
  };

  const handleToggleSystem = () => {
    setSystemNotifications((prev) => !prev);
  };

  return (
    <div className={mainContainer}>
      <div className="space-y-4">
        {/* 1) Enable Email Notifications */}
        <div className="flex items-center justify-between">
          <span className={`${labelClass} text-gray-700`}>Enable Email Notifications</span>
          <button
            type="button"
            onClick={handleToggleEmail}
            className={`${toggleButtonBase} ${emailNotifications ? 'bg-[#039994]' : 'bg-gray-300'}`}
          >
            <span
              className={`${toggleHandleBase} ${emailNotifications ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* 2) Enable On-screen Notifications */}
        <div className="flex items-center justify-between">
          <span className={`${labelClass} text-gray-700`}>Enable On-screen Notifications</span>
          <button
            type="button"
            onClick={handleToggleOnScreen}
            className={`${toggleButtonBase} ${onScreenNotifications ? 'bg-[#039994]' : 'bg-gray-300'}`}
          >
            <span
              className={`${toggleHandleBase} ${onScreenNotifications ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* 3) Receive System Notifications */}
        <div className="flex items-center justify-between">
          <span className={`${labelClass} text-gray-700`}>Receive System Notifications</span>
          <button
            type="button"
            onClick={handleToggleSystem}
            className={`${toggleButtonBase} ${systemNotifications ? 'bg-[#039994]' : 'bg-gray-300'}`}
          >
            <span
              className={`${toggleHandleBase} ${systemNotifications ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNotifications;
