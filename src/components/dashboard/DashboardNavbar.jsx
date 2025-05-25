import React from "react";
import { FaBars, FaSearch, FaBell, FaHeadset } from "react-icons/fa";

const DashboardNavbar = ({
  toggleSidebar,
  selectedSection,
  sectionDisplayMap,
  onSectionChange,      // ← new prop
}) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-full px-4 py-3 flex items-center justify-between">
        {/* Left: Hamburger + Title + Sales Agent */}
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={toggleSidebar}>
            <FaBars className="text-gray-700" size={20} />
          </button>

          <h1 className="font-[550] text-[16px] leading-[50%] tracking-[-0.05em] text-[#1E1E1E] font-sfpro text-center">
            {sectionDisplayMap[selectedSection]}
          </h1>

          <button className="bg-[#1E1E1E] text-white px-2 py-1.5 rounded-full text-[10px] font-medium font-sfpro">
            Sales Agent
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center mx-4">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center">
              <div className="bg-[#039994] h-full px-3 flex items-center justify-center rounded-l-md">
                <FaSearch className="text-white" size={14} />
              </div>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>
        </div>

        {/* Right: Notifications & Support */}
        <div className="flex items-center space-x-6">
          {/* Bell → routes to notifications section */}
          <button
            onClick={() => onSectionChange("notifications")}
            className="relative focus:outline-none"
          >
            <FaBell
              className={
                selectedSection === "notifications"
                  ? "text-[#039994]"
                  : "text-[#039994] hover:text-gray-600"
              }
              size={20}
            />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Support icon stays unchanged */}
          <FaHeadset className="text-[#039994]" size={20} />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
