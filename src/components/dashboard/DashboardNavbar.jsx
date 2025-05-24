import React from "react";
import { FaBars, FaSignOutAlt } from "react-icons/fa";

const DashboardNavbar = ({
  toggleSidebar,
  selectedSection,
  sectionDisplayMap,
  onSectionChange,
  isSidebarCollapsed = false,
}) => {
  
  // Section display mapping with proper titles
  const defaultSectionMap = {
    overview: "Dashboard Overview",
    userManagement: "User Management", 
    recSalesManagement: "Customer List",
    myAccount: "My Account",
    userSupport: "Support Center",
    notifications: "Notifications",
    logout: "Logout",
    ...sectionDisplayMap
  };

  const getCurrentTitle = () => {
    return defaultSectionMap[selectedSection] || "Welcome to your Dashboard!";
  };

  const handleLogout = () => {
    if (onSectionChange) {
      onSectionChange('logout');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        
        {/* Left Section: Toggle + Title */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-gray-600 hover:text-gray-800" size={18} />
          </button>
          
          {/* Page Title */}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
              {getCurrentTitle()}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedSection === 'overview' && "Monitor your system performance and activities"}
              {selectedSection === 'userManagement' && "Manage customer accounts and permissions"}
              {selectedSection === 'recSalesManagement' && "View and manage customer database"}
              {selectedSection === 'myAccount' && "Update your profile and account settings"}
              {selectedSection === 'userSupport' && "Get help and submit support tickets"}
              {selectedSection === 'notifications' && "View and manage your notifications"}
            </p>
          </div>
        </div>

        {/* Right Section: User Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Notifications Badge */}
          <div className="relative">
            <button
              onClick={() => onSectionChange && onSectionChange("notifications")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200 relative"
              aria-label="Notifications"
            >
              <svg 
                className="w-5 h-5 text-gray-600 hover:text-gray-800" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-5 5v-5zM12 17.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" 
                />
              </svg>
              {/* Notification dot */}
              <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              <svg 
                className="w-5 h-5 text-gray-600" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-200 flex items-center space-x-2"
            aria-label="Logout"
          >
            <FaSignOutAlt size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Section Title (when sidebar is collapsed) */}
      {isSidebarCollapsed && (
        <div className="md:hidden px-6 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Current: <span className="font-medium text-gray-800">{getCurrentTitle()}</span>
          </p>
        </div>
      )}
    </header>
  );
};

export default DashboardNavbar;