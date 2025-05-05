import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import { FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const SendReminderModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const [rangeType, setRangeType] = useState('individual');
  const [singleEmail, setSingleEmail] = useState(initialEmail);
  const [bulkEmails, setBulkEmails] = useState(['']);
  const [reminderReason, setReminderReason] = useState('Registration');
  const [reminderDescription, setReminderDescription] = useState('You have a pending registration with DCarbon. Please complete your registration to access our services.');
  const [isSending, setIsSending] = useState(false);
  const [emailStatuses, setEmailStatuses] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isOpen && initialEmail) {
      setSingleEmail(initialEmail);
      setRangeType('individual');
    }
  }, [isOpen, initialEmail]);

  const resetForm = () => {
    setRangeType('individual');
    setSingleEmail(initialEmail);
    setBulkEmails(['']);
    setReminderReason('Registration');
    setReminderDescription('You have a pending registration with DCarbon. Please complete your registration to access our services.');
    setEmailStatuses([]);
    setShowResults(false);
  };

  const handleAddBulkEmail = () => {
    setBulkEmails([...bulkEmails, '']);
  };

  const handleBulkEmailChange = (index, value) => {
    const updated = [...bulkEmails];
    updated[index] = value;
    setBulkEmails(updated);
  };

  const handleRemoveBulkEmail = (index) => {
    const updated = [...bulkEmails];
    updated.splice(index, 1);
    setBulkEmails(updated);
  };

  const validateEmails = (emails) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emails.every(email => emailRegex.test(email));
  };

  const showEmailStatusToasts = (emailStatuses) => {
    emailStatuses.forEach(status => {
      if (status.canSendReminder) {
        toast.success(`Reminder sent to: ${status.email}`);
      } else {
        toast.error(`No referral found for: ${status.email}`);
      }
    });
  };

  const handleSendReminder = async () => {
    const emails = rangeType === 'individual' 
      ? [singleEmail] 
      : bulkEmails.filter(Boolean);

    if (emails.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }

    if (!validateEmails(emails)) {
      toast.error('Please enter valid email addresses');
      return;
    }

    setIsSending(true);
    setShowResults(false);

    try {
      const authToken = localStorage.getItem('authToken');
      const body = {
        emails,
        reason: reminderReason,
        description: reminderDescription,
      };

      const response = await axios.post(
        'https://services.dcarbon.solutions/api/user/referral-reminders',
        body,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response?.data?.status === 'success') {
        const { emailStatuses, summary } = response.data.data;
        setEmailStatuses(emailStatuses);
        setShowResults(true);
        showEmailStatusToasts(emailStatuses);

        if (summary.processedEmails > 0) {
          toast.success(`Reminder sent successfully`);
        } else {
          toast.error('No valid referrals found');
        }
      } else {
        toast.error('Failed to send reminders');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error(error.response?.data?.message || 'Error sending reminders');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="font-sfpro text-xl font-semibold mb-2 text-[#039994]">
          Send Registration Reminder
        </h2>

        <hr className="border-black my-2" />

        {!showResults ? (
          <>
            <div className="mb-4">
              <label className="block font-sfpro text-sm font-medium mb-2">
                Customer Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  className="w-full px-10 py-2 rounded-md focus:outline-none text-sm font-sfpro bg-[#F1F1F1]"
                  disabled={rangeType === 'bulk'}
                />
                <FaSearch className="absolute top-3 left-3 text-gray-400" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-sfpro text-sm font-medium mb-2">
                Reminder Reason
              </label>
              <select
                className="w-full px-3 py-2 rounded-md text-sm font-sfpro bg-[#F1F1F1]"
                value={reminderReason}
                onChange={(e) => setReminderReason(e.target.value)}
              >
                <option value="Registration">Registration</option>
                <option value="Document Upload">Document Upload</option>
                <option value="Document Verification">Document Verification</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-sfpro text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-md text-sm font-sfpro bg-[#F1F1F1]"
                rows={3}
                value={reminderDescription}
                onChange={(e) => setReminderDescription(e.target.value)}
              />
            </div>

            <hr className="my-4" />

            <div className="flex space-x-4">
              <button
                onClick={resetForm}
                className="w-1/2 py-2 rounded-md text-sm font-sfpro bg-[#F2F2F2]"
                disabled={isSending}
              >
                Clear
              </button>
              <button
                onClick={handleSendReminder}
                className="w-1/2 py-2 rounded-md text-white text-sm font-sfpro bg-[#039994] hover:bg-[#02857f] disabled:opacity-50"
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send Reminder'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="font-sfpro font-medium text-lg mb-2">Reminder Results</h3>
              <div className="space-y-3">
                {emailStatuses.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{status.email}</p>
                      <p className="text-sm text-gray-600">{status.status}</p>
                    </div>
                    {status.canSendReminder ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full py-2 rounded-md text-white text-sm font-sfpro bg-[#039994] hover:bg-[#02857f]"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SendReminderModal;