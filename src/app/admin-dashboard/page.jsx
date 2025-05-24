'use client';

import React, { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import DashboardOverview from '@/components/dashboard/overview/DashboardOverview';
import Reporting from '@/components/dashboard/reporting/Reporting';
import RECManagement from '@/components/dashboard/rec-sales/RECManagement';
import ResiGroupManagement from '@/components/dashboard/resi-group/ResiGroupManagement';
import CommissionStructure from '@/components/dashboard/commission/CommissionStructure';
import PayoutProcessing from '@/components/dashboard/payout/PayoutProcessing';
import DashboardContactSupport from '@/components/dashboard/ContactSupport';
import DashboardHelpCentre from '@/components/dashboard/HelpCentre';
import DashboardNotifications from '@/components/dashboard/Notifications';
import DashboardLogout from '@/components/dashboard/Logout';
import MyAccount from '@/components/dashboard/account/MyAccount';
import AgreementManagement from '@/components/dashboard/agreement/AgreementManagement';
import UserSupport from '@/components/dashboard/user-support/UserSupport';
import UserManagement from '@/components/dashboard/user-management/UserManagement';

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sectionDisplayMap = {
    overview: 'Overview',
    userManagement: 'User Management',
    recSalesManagement: 'REC Sales Management',
    resiGroupManagement: 'Resi. Group Management',
    commissionStructure: 'Commission Structure',
    payoutProcessing: 'Payout Processing',
    reporting: 'Reporting',
    myAccount: 'My Account',
    agreementManagement: 'Agreement Management',
    userSupport: 'User Support',
    notifications: 'Notifications',
    helpCenter: 'Help Centre (FAQs)',
    contactSupport: 'Contact Support',
    logout: 'Log Out',
  };

  let SectionComponent;
  switch (activeSection) {
    case 'overview': SectionComponent = DashboardOverview; break;
    case 'userManagement': SectionComponent = UserManagement; break;
    case 'recSalesManagement': SectionComponent = RECManagement; break;
    case 'resiGroupManagement': SectionComponent = ResiGroupManagement; break;
    case 'commissionStructure': SectionComponent = CommissionStructure; break;
    case 'payoutProcessing': SectionComponent = PayoutProcessing; break;
    case 'reporting': SectionComponent = Reporting; break;
    case 'myAccount': SectionComponent = MyAccount; break;
    case 'agreementManagement': SectionComponent = AgreementManagement; break;
    case 'userSupport': SectionComponent = UserSupport; break;
    case 'notifications': SectionComponent = DashboardNotifications; break;
    case 'helpCenter': SectionComponent = DashboardHelpCentre; break;
    case 'contactSupport': SectionComponent = DashboardContactSupport; break;
    case 'logout': SectionComponent = DashboardLogout; break;
    default: SectionComponent = DashboardOverview;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed">
        <DashboardSidebar
          selectedSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </aside>

      {/* Main Area */}
      <div className="md:ml-64 flex-1 flex flex-col">
        <DashboardNavbar
          toggleSidebar={toggleSidebar}
          selectedSection={activeSection}
          sectionDisplayMap={sectionDisplayMap}
          onSectionChange={handleSectionChange}
          isSidebarCollapsed={sidebarOpen}
        />

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleSidebar} />
            <div className="relative bg-white w-64 h-full shadow-md">
              <DashboardSidebar
                selectedSection={activeSection}
                onSectionChange={handleSectionChange}
                toggleSidebar={toggleSidebar}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-6">
            {activeSection === 'logout'
              ? <DashboardLogout />
              : <SectionComponent />
            }
          </div>
        </main>
      </div>
    </div>
  );
}