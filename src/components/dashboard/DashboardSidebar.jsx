'use client';

import React, { useState, useEffect } from 'react';
import {
  FiHome,
  FiUsers,
  FiPieChart,
  FiLayers,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiHeadphones,
  FiUser,
  FiLogOut
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
  const { profile, loading } = useProfile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = (section) => section === selectedSection;

  // Style constants
  const sidebarContainer = 'bg-white w-64 min-h-screen flex flex-col border-r border-gray-200 overflow-y-auto hide-scrollbar';
  const sidebarSection = 'px-4 py-2';
  const sidebarDivider = 'my-2 border-gray-200 mx-4';
  const sectionHeading = 'text-xs font-sfpro font-normal tracking-[0.2em] text-[#1E1E1E] uppercase';
  const menuItemBase = 'flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro';
  const menuItemActive = 'bg-[#039994] text-white';
  const menuItemInactive = 'text-[#1E1E1E] hover:bg-gray-100';
  const iconBase = 'w-4 h-4';
  const userInfoContainer = 'px-4 py-3 flex flex-col items-start mt-auto';
  const userProfile = 'flex items-center space-x-3 mb-3';
  const greetingText = 'text-[#1E1E1E] font-sfpro text-sm';
  const userName = 'text-[#1E1E1E] font-sfpro text-sm font-semibold';
  const activeDot = 'w-2 h-2 rounded-full bg-[#039994] ml-2';

  if (!isClient) {
    return (
      <aside className={sidebarContainer}>
        <div className="flex justify-center p-4">
          <div className="h-8 w-[120px] bg-gray-200 rounded"></div>
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
            className="text-gray-700 hover:text-gray-900 text-2xl"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex justify-center p-4">
        <Image
          src="/dashboard_images/logo.png"
          alt="Company Logo"
          width={120}
          height={40}
          className="h-8 w-auto"
        />
      </div>

      {/* MAIN MENU */}
      <div className={sidebarSection}>
        <h3 className={sectionHeading}>Dashboard</h3>
      </div>
      <nav className="flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange('overview')}
          className={`${menuItemBase} ${isActive('overview') ? menuItemActive : menuItemInactive}`}
        >
          <FiHome className={iconBase} color={isActive('overview') ? '#FFFFFF' : '#039994'} />
          <span>Overview</span>
        </button>
        <button
          onClick={() => onSectionChange('userManagement')}
          className={`${menuItemBase} ${isActive('userManagement') ? menuItemActive : menuItemInactive}`}
        >
          <FiUsers className={iconBase} color={isActive('userManagement') ? '#FFFFFF' : '#039994'} />
          <span>User Management</span>
        </button>
        <button
          onClick={() => onSectionChange('recSalesManagement')}
          className={`${menuItemBase} ${isActive('recSalesManagement') ? menuItemActive : menuItemInactive}`}
        >
          <FiPieChart className={iconBase} color={isActive('recSalesManagement') ? '#FFFFFF' : '#039994'} />
          <span>REC Sales Management</span>
        </button>
        <button
          onClick={() => onSectionChange('resiGroupManagement')}
          className={`${menuItemBase} ${isActive('resiGroupManagement') ? menuItemActive : menuItemInactive}`}
        >
          <FiLayers className={iconBase} color={isActive('resiGroupManagement') ? '#FFFFFF' : '#039994'} />
          <span>Resi. Group Management</span>
        </button>
        <button
          onClick={() => onSectionChange('commissionStructure')}
          className={`${menuItemBase} ${isActive('commissionStructure') ? menuItemActive : menuItemInactive}`}
        >
          <FiDollarSign className={iconBase} color={isActive('commissionStructure') ? '#FFFFFF' : '#039994'} />
          <span>Commission Structure</span>
        </button>
        <button
          onClick={() => onSectionChange('payoutProcessing')}
          className={`${menuItemBase} ${isActive('payoutProcessing') ? menuItemActive : menuItemInactive}`}
        >
          <FiCreditCard className={iconBase} color={isActive('payoutProcessing') ? '#FFFFFF' : '#039994'} />
          <span>Payout Processing</span>
        </button>
        <button
          onClick={() => onSectionChange('reporting')}
          className={`${menuItemBase} ${isActive('reporting') ? menuItemActive : menuItemInactive}`}
        >
          <FiFileText className={iconBase} color={isActive('reporting') ? '#FFFFFF' : '#039994'} />
          <span>Reporting</span>
        </button>
      </nav>

      <hr className={sidebarDivider} />

      {/* SETTINGS */}
      <div className={sidebarSection}>
        <h3 className={sectionHeading}>Settings</h3>
      </div>
      <nav className="flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange('myAccount')}
          className={`${menuItemBase} ${isActive('myAccount') ? menuItemActive : menuItemInactive}`}
        >
          <FiUser className={iconBase} color={isActive('myAccount') ? '#FFFFFF' : '#039994'} />
          <span>My Account</span>
        </button>
        <button
          onClick={() => onSectionChange('agreementManagement')}
          className={`${menuItemBase} ${isActive('agreementManagement') ? menuItemActive : menuItemInactive}`}
        >
          <FiFileText className={iconBase} color={isActive('agreementManagement') ? '#FFFFFF' : '#039994'} />
          <span>Agreement Management</span>
        </button>
      </nav>

      <hr className={sidebarDivider} />

      {/* SUPPORT */}
      <div className={sidebarSection}>
        <h3 className={sectionHeading}>Support</h3>
      </div>
      <nav className="flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange('userSupport')}
          className={`${menuItemBase} ${isActive('userSupport') ? menuItemActive : menuItemInactive}`}
        >
          <FiHeadphones className={iconBase} color={isActive('userSupport') ? '#FFFFFF' : '#039994'} />
          <span>User Support</span>
        </button>
      </nav>

      <div className={userInfoContainer}>
        <div className={userProfile}>
          <div className="w-8 h-8 rounded-full overflow-hidden relative">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse"></div>
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
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <FiUser className="text-gray-500" />
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
        <button
          onClick={() => onSectionChange('logout')}
          className={`${menuItemBase} ${isActive('logout') ? menuItemActive : menuItemInactive}`}
        >
          <FiLogOut className={iconBase} color={isActive('logout') ? '#FFFFFF' : '#039994'} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
