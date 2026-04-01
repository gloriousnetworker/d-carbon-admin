'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import LogoutModal from '@/components/dashboard/Logout';
import MyAccount from '@/components/dashboard/account/MyAccount';
import AgreementManagement from '@/components/dashboard/agreement/AgreementManagement';
import DocumentConfiguration from '@/components/dashboard/agreement/DocumentConfiguration';
import UserSupport from '@/components/dashboard/user-support/UserSupport';
import UserManagement from '@/components/dashboard/user-management/UserManagement';
import Faq from '@/components/dashboard/faq/Faq';
import FeedbackPage from '@/components/dashboard/FeedbackPage';
import RegistrationPipeline from '@/components/dashboard/registration-pipeline/RegistrationPipeline';
import SystemJobs from '@/components/dashboard/system/SystemJobs';

const VALID_SECTIONS = [
  'overview', 'userManagement', 'recSalesManagement', 'resiGroupManagement',
  'commissionStructure', 'payoutProcessing', 'reporting', 'myAccount',
  'agreementManagement', 'documentConfiguration', 'userSupport', 'notifications', 'helpCenter',
  'contactSupport', 'faq', 'feedback', 'registrationPipeline', 'systemJobs',
];

const SECTION_COMPONENTS = {
  overview: DashboardOverview,
  userManagement: UserManagement,
  recSalesManagement: RECManagement,
  resiGroupManagement: ResiGroupManagement,
  commissionStructure: CommissionStructure,
  payoutProcessing: PayoutProcessing,
  reporting: Reporting,
  myAccount: MyAccount,
  agreementManagement: AgreementManagement,
  documentConfiguration: DocumentConfiguration,
  userSupport: UserSupport,
  notifications: DashboardNotifications,
  helpCenter: DashboardHelpCentre,
  contactSupport: DashboardContactSupport,
  faq: Faq,
  feedback: FeedbackPage,
  registrationPipeline: RegistrationPipeline,
  systemJobs: SystemJobs,
};

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
  documentConfiguration: 'Document Configuration',
  userSupport: 'User Support',
  notifications: 'Notification',
  helpCenter: 'Help Centre (FAQs)',
  contactSupport: 'Contact Support',
  faq: 'FAQs',
  feedback: 'Feedback',
  registrationPipeline: 'Registration Pipeline',
  systemJobs: 'System Jobs',
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const activeSection = VALID_SECTIONS.includes(sectionFromUrl) ? sectionFromUrl : 'overview';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');

      if (!authToken) {
        router.push('/login');
        return;
      }

      if (userRole && userRole !== 'ADMIN') {
        // Token present but not an admin — clear session and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userProfilePicture');
        router.push('/login');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSectionChange = useCallback((section) => {
    if (section === 'logout') {
      setShowLogoutModal(true);
      return;
    }
    router.push(`/admin-dashboard?section=${section}`);
    setSidebarOpen(false);
  }, [router]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const SectionComponent = SECTION_COMPONENTS[activeSection] || DashboardOverview;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed">
        <DashboardSidebar
          selectedSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </aside>

      <div className="md:ml-64 flex-1 flex flex-col">
        <DashboardNavbar
          toggleSidebar={toggleSidebar}
          selectedSection={activeSection}
          sectionDisplayMap={sectionDisplayMap}
          onSectionChange={handleSectionChange}
        />

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

        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-6">
            <SectionComponent />
          </div>
        </main>
      </div>

      {showLogoutModal && (
        <LogoutModal onClose={() => setShowLogoutModal(false)} />
      )}
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
