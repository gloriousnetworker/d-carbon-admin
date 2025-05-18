import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import { FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Import your style exports from styles.js (adjust as needed)
import {
  mainContainer,
  headingContainer,
  pageTitle,
  formWrapper,
  labelClass,
  inputClass,
  selectClass,
  buttonPrimary,
} from '../../styles';

const SendReminderModal = ({ isOpen, onClose }) => {
  const [rangeType, setRangeType] = useState('individual');
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState(['']);
  const [reminderReason, setReminderReason] = useState('');
  const [reminderDescription, setReminderDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailStatuses, setEmailStatuses] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [summary, setSummary] = useState({
    totalEmails: 0,
    pendingReferrals: 0,
    nonExistentReferrals: 0,
    processedEmails: 0
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setRangeType('individual');
    setSingleEmail('');
    setBulkEmails(['']);
    setReminderReason('');
    setReminderDescription('');
    setEmailStatuses([]);
    setSummary({
      totalEmails: 0,
      pendingReferrals: 0,
      nonExistentReferrals: 0,
      processedEmails: 0
    });
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
        toast.success(`Reminder sent to: ${status.email} (${status.status})`);
      } else {
        toast.error(`No referral found for: ${status.email} (${status.status})`, {
          icon: <FaTimes className="text-red-500" />
        });
      }
    });
  };

  const handleSendReminder = async () => {
    const emails = rangeType === 'individual' 
      ? [singleEmail] 
      : bulkEmails.filter(Boolean);

    // Validate emails
    if (emails.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }

    if (!validateEmails(emails)) {
      toast.error('Please enter valid email addresses');
      return;
    }

    if (!reminderReason) {
      toast.error('Please select a reminder reason');
      return;
    }

    setIsSending(true);
    setShowResults(false);

    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      if (!authToken || !userId) {
        toast.error('Authentication credentials not found. Please log in again.');
        setIsSending(false);
        return;
      }

      const body = {
        emails,
        reason: reminderReason,
        description: reminderDescription,
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/referral-reminders/${userId}`,
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
        setSummary(summary);
        setShowResults(true);
        
        // Show detailed toasts for each email status
        showEmailStatusToasts(emailStatuses);

        // Show summary toast
        if (summary.processedEmails > 0) {
          toast.success(
            `Successfully sent ${summary.processedEmails} reminder(s)`,
            {
              duration: 3000,
              icon: <FaCheck className="text-green-500" />
            }
          );
        } else {
          toast.error(
            'No reminders sent - no valid referrals found',
            {
              duration: 3000,
              icon: <FaTimes className="text-red-500" />
            }
          );
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="font-sfpro text-xl font-semibold mb-2 text-[#039994]">
          Send Reminder
        </h2>

        <hr className="border-black my-2" />

        {!showResults ? (
          <>
            <label className="block font-sfpro text-sm font-medium mt-2 mb-2">
              Select Range
            </label>
            <div className="flex items-center space-x-6 mb-4">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name="rangeType"
                  checked={rangeType === 'individual'}
                  onChange={() => setRangeType('individual')}
                />
                <span className="text-sm font-sfpro">Individual Customer</span>
              </label>

              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name="rangeType"
                  checked={rangeType === 'bulk'}
                  onChange={() => setRangeType('bulk')}
                />
                <span className="text-sm font-sfpro">Bulk Customer</span>
              </label>
            </div>

            <label className="block font-sfpro text-sm font-medium mb-2">
              Search Customer
            </label>
            
            {rangeType === 'individual' ? (
              <div className="relative mb-4">
                <input
                  type="email"
                  placeholder="Enter registered email address"
                  className="w-full px-10 py-2 rounded-md focus:outline-none text-sm font-sfpro bg-[#F1F1F1]"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                />
                <FaSearch className="absolute top-3 left-3 text-gray-400" />
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {bulkEmails.map((email, idx) => (
                  <div key={idx} className="relative">
                    <input
                      type="email"
                      placeholder="Enter registered email address"
                      className="w-full px-10 py-2 rounded-md focus:outline-none text-sm font-sfpro bg-[#F1F1F1]"
                      value={email}
                      onChange={(e) => handleBulkEmailChange(idx, e.target.value)}
                    />
                    <FaSearch className="absolute top-3 left-3 text-gray-400" />
                    {idx > 0 && (
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-sm text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveBulkEmail(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddBulkEmail}
                  className="text-sm text-[#039994] hover:underline"
                >
                  + Add another email
                </button>
              </div>
            )}

            <label className="block font-sfpro text-sm font-medium mb-2">
              Reminder Reason
            </label>
            <select
              className="w-full px-3 py-2 rounded-md mb-4 text-sm font-sfpro bg-[#F1F1F1]"
              value={reminderReason}
              onChange={(e) => setReminderReason(e.target.value)}
            >
              <option value="" disabled>
                Choose reason
              </option>
              <option value="Registration">Registration</option>
              <option value="Incorrect Customer Information">
                Incorrect Customer Information
              </option>
              <option value="Document Upload">Document Upload</option>
              <option value="Document Verification">Document Verification</option>
              <option value="Document Rejection">Document Rejection</option>
              <option value="Document Requirement">Document Requirement</option>
              <option value="Don't miss out!">Don't miss out!</option>
            </select>

            <label className="block font-sfpro text-sm font-medium mb-2">
              Reminder Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-md text-sm font-sfpro bg-[#F1F1F1]"
              rows={3}
              placeholder="Description"
              value={reminderDescription}
              onChange={(e) => setReminderDescription(e.target.value)}
            />

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

            <div className="bg-blue-50 p-3 rounded mb-4">
              <h4 className="font-sfpro font-medium mb-1">Summary</h4>
              <p className="text-sm">
                Total emails: {summary.totalEmails} | 
                Processed: {summary.processedEmails} | 
                Pending referrals: {summary.pendingReferrals} | 
                Non-existent referrals: {summary.nonExistentReferrals}
              </p>
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