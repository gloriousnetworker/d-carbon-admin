import React, { useState, useEffect } from "react";
import SendReminderModal from "../overview/modals/SendReminderModal";

export default function TwoCardsDashboard() {
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [errorPending, setErrorPending] = useState(null);

  const [workProgress, setWorkProgress] = useState({
    pendingRegistrations: 0,
    incompleteDocumentation: 0,
    documentRejections: 0,
    pendingApproval: 0,
    completeDocumentation: 0
  });
  const [loadingWorkProgress, setLoadingWorkProgress] = useState(true);
  const [errorWorkProgress, setErrorWorkProgress] = useState(null);

  const [selectedEmail, setSelectedEmail] = useState("");
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);

  useEffect(() => {
    // Mock data loading
    const fetchData = async () => {
      try {
        setLoadingPending(true);
        setLoadingWorkProgress(true);
        
        // Mock pending referrals data
        setTimeout(() => {
          setPendingReferrals([
            { inviteeEmail: "customer1@example.com", status: "PENDING" },
            { inviteeEmail: "customer2@example.com", status: "PENDING" },
            { inviteeEmail: "customer3@example.com", status: "PENDING" },
            { inviteeEmail: "customer4@example.com", status: "PENDING" },
            { inviteeEmail: "customer5@example.com", status: "PENDING" },
            { inviteeEmail: "customer6@example.com", status: "PENDING" },
          ]);

          // Mock work progress data
          setWorkProgress({
            pendingRegistrations: 12,
            incompleteDocumentation: 8,
            documentRejections: 3,
            pendingApproval: 5,
            completeDocumentation: 25
          });

          setLoadingPending(false);
          setLoadingWorkProgress(false);
        }, 500);
      } catch (err) {
        setErrorPending(err.message || "Failed to load pending referrals");
        setErrorWorkProgress(err.message || "Failed to load work progress");
        setLoadingPending(false);
        setLoadingWorkProgress(false);
      }
    };

    fetchData();
  }, []);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setShowReminderModal(true);
  };

  const toggleShowAllPending = () => {
    setShowAllPending(!showAllPending);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Pending Customer Registrations Card */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src="/vectors/UserCircleDashed.png"
            alt="Registrations Icon"
            className="h-5 w-5 object-contain"
          />
          <h3 className="text-[#1E1E1E] font-semibold text-sm">
            Pending Customer Registrations ({pendingReferrals.length})
          </h3>
        </div>
        {loadingPending ? (
          <div className="flex justify-center items-center h-16">
            <p className="animate-pulse text-gray-500">Loading pending...</p>
          </div>
        ) : errorPending ? (
          <p className="text-red-500 text-sm">Error: {errorPending}</p>
        ) : (
          <>
            <hr className="my-2 border-black" />
            <div className="overflow-y-auto max-h-52 pr-2">
              {pendingReferrals.length > 0 ? (
                (showAllPending ? pendingReferrals : pendingReferrals.slice(0, 5)).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between mb-2 gap-2"
                  >
                    <button
                      onClick={() => handleEmailClick(item.inviteeEmail)}
                      className="text-[#1E1E1E] text-sm font-medium hover:underline truncate flex-1 text-left min-w-0"
                      title={item.inviteeEmail}
                    >
                      <span className="truncate block">{item.inviteeEmail || "Unknown User"}</span>
                    </button>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                      style={{
                        border: "0.5px solid #FFB200",
                        backgroundColor: "#FFFAED",
                        color: "#FFB200",
                      }}
                    >
                      Pending
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  No pending registrations.
                </div>
              )}
            </div>
            {pendingReferrals.length > 5 && (
              <>
                <hr className="my-2 border-black" />
                <div className="flex justify-end">
                  <button
                    onClick={toggleShowAllPending}
                    className="text-white text-xs px-3 py-1 rounded"
                    style={{ backgroundColor: "#039994" }}
                  >
                    {showAllPending ? "Show less" : "View more"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Documentation Progress Card */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src="/vectors/Files.png"
            alt="Work Icon"
            className="h-5 w-5 object-contain"
          />
          <h3 className="text-[#1E1E1E] font-semibold text-sm">Documentation Progress</h3>
        </div>
        {loadingWorkProgress ? (
          <div className="flex justify-center items-center h-16">
            <p className="animate-pulse text-gray-500">Loading progress...</p>
          </div>
        ) : errorWorkProgress ? (
          <p className="text-red-500 text-sm">Error: {errorWorkProgress}</p>
        ) : (
          <>
            <hr className="my-2 border-black" />
            <WorkProgressItem
              label="Pending Registrations"
              color="#FFB200"
              value={workProgress.pendingRegistrations}
            />
            <WorkProgressItem
              label="Incomplete Documentation"
              color="#FFB200"
              value={workProgress.incompleteDocumentation}
            />
            <WorkProgressItem
              label="Document Rejections"
              color="#FF0000"
              value={workProgress.documentRejections}
            />
            <WorkProgressItem
              label="Pending Approval"
              color="#039994"
              value={workProgress.pendingApproval}
            />
            <WorkProgressItem 
              label="Complete Documentation" 
              color="#1E1E1E" 
              value={workProgress.completeDocumentation} 
            />
          </>
        )}
      </div>

      {/* Send Reminder Modal */}
      {showReminderModal && (
        <SendReminderModal
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          initialEmail={selectedEmail}
        />
      )}
    </div>
  );
}

function WorkProgressItem({ label, color, value }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-[#1E1E1E] text-sm">{label}</span>
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
        style={{ backgroundColor: color }}
      >
        {value}
      </div>
    </div>
  );
}