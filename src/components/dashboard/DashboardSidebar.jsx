'use client';

import React, { useState, useEffect } from 'react';
import {
  FiGrid,
  FiUsers,
  FiSettings,
  FiHeadphones,
  FiUser,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import Image from 'next/image';
import { useProfile } from '@/components/contexts/ProfileContext';

const DashboardSidebar = ({
  onSectionChange,
  selectedSection = 'overview',
  toggleSidebar,
  hasPendingActions = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isCustomersOpen, setIsCustomersOpen] = useState(false);
  const { profile, loading } = useProfile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = (section) => section === selectedSection;

  // Check if any customer subsection is active
  const isCustomerSectionActive = () => {
    return isActive('userManagement') || isActive('recSalesManagement');
  };

  // Style constants
  const sidebarContainer = 'bg-[#3B4859] w-64 min-h-screen flex flex-col overflow-y-auto hide-scrollbar';
  const headerContainer = 'px-6 py-6 border-b border-[#4A5568]';
  const headerTitle = 'text-white text-xl font-semibold';
  const menuSection = 'px-4 py-4';
  const menuItemBase = 'flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 text-sm font-medium mb-1';
  const menuItemActive = 'bg-[#039994] text-white shadow-lg';
  const menuItemInactive = 'text-gray-300 hover:bg-[#4A5568] hover:text-white';
  const submenuItemBase = 'flex items-center gap-3 px-8 py-2 rounded-lg w-full text-left transition-all duration-200 text-sm font-normal mb-1';
  const submenuItemActive = 'bg-[#039994] text-white shadow-lg';
  const submenuItemInactive = 'text-gray-400 hover:bg-[#4A5568] hover:text-white';
  const iconBase = 'w-5 h-5 flex-shrink-0';
  const userInfoContainer = 'px-4 py-4 mt-auto border-t border-[#4A5568]';
  const userProfile = 'flex items-center space-x-3 mb-3 px-2';
  const greetingText = 'text-gray-300 text-sm';
  const userName = 'text-white text-sm font-medium';
  const activeDot = 'w-2 h-2 rounded-full bg-[#039994] ml-2';

  if (!isClient) {
    return (
      <aside className={sidebarContainer}>
        <div className={headerContainer}>
          <div className="h-6 w-32 bg-gray-600 rounded"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={sidebarContainer}>
      {toggleSidebar && (
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className={headerContainer}>
        <h1 className={headerTitle}>Admin Panel</h1>
      </div>

      {/* Main Navigation */}
      <nav className={menuSection}>
        {/* Dashboard */}
        <button
          onClick={() => onSectionChange('overview')}
          className={`${menuItemBase} ${isActive('overview') ? menuItemActive : menuItemInactive}`}
        >
          <FiGrid className={iconBase} />
          <span>Dashboard</span>
        </button>

        {/* Customers with Dropdown */}
        <div className="mb-1">
          <button
            onClick={() => setIsCustomersOpen(!isCustomersOpen)}
            className={`${menuItemBase} ${isCustomerSectionActive() ? menuItemActive : menuItemInactive}`}
          >
            <FiUsers className={iconBase} />
            <span className="flex-1 text-left">Customers</span>
            {isCustomersOpen ? (
              <FiChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <FiChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
          </button>
          
          {/* Submenu */}
          {isCustomersOpen && (
            <div className="mt-1 space-y-1">
              <button
                onClick={() => onSectionChange('userManagement')}
                className={`${submenuItemBase} ${isActive('userManagement') ? submenuItemActive : submenuItemInactive}`}
              >
                <FiSettings className="w-4 h-4 flex-shrink-0" />
                <span>Manage Customers</span>
              </button>
              <button
                onClick={() => onSectionChange('recSalesManagement')}
                className={`${submenuItemBase} ${isActive('recSalesManagement') ? submenuItemActive : submenuItemInactive}`}
              >
                <FiUsers className="w-4 h-4 flex-shrink-0" />
                <span>List Customers</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Section */}
      <div className="px-4 py-2">
        <div className="border-t border-[#4A5568] pt-4">
          <button
            onClick={() => onSectionChange('myAccount')}
            className={`${menuItemBase} ${isActive('myAccount') ? menuItemActive : menuItemInactive}`}
          >
            <FiUser className={iconBase} />
            <span>My Account</span>
          </button>
        </div>
      </div>

      {/* Support Section */}
      <div className="px-4 py-2">
        <button
          onClick={() => onSectionChange('userSupport')}
          className={`${menuItemBase} ${isActive('userSupport') ? menuItemActive : menuItemInactive}`}
        >
          <FiHeadphones className={iconBase} />
          <span>Support</span>
        </button>
      </div>

      {/* User Profile Section */}
      <div className={userInfoContainer}>
        <div className={userProfile}>
          <div className="w-8 h-8 rounded-full overflow-hidden relative bg-[#4A5568]">
            {loading ? (
              <div className="w-full h-full bg-gray-600 animate-pulse"></div>
            ) : profile?.picture ? (
              <Image
                src={profile.picture}
                alt="User profile"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/dashboard_images/profile_image.png';
                }}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-[#4A5568] flex items-center justify-center">
                <FiUser className="text-gray-400 w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex items-center">
            <span className={greetingText}>Hi, </span>
            <span className={userName}>
              {loading ? 'Loading...' : profile?.firstName || 'User'}
            </span>
            <span className={activeDot}></span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;