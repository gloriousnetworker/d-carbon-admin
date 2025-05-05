"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const DashboardContactSupport = () => {
  // Component code remains the same
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error('User authentication required. Please login again.');
      setIsSubmitting(false);
      return;
    }

    const loadingToast = toast.loading('Submitting your request...');

    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/contact/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subject,
          contactReason: reason,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Contact request submitted successfully!', { id: loadingToast });
        setSubject('');
        setReason('');
        setMessage('');
      } else {
        toast.error(data.message || 'Failed to submit contact request', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles and UI remain as you originally had them.
  const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
  const headingContainer = 'relative w-full flex flex-col items-center mb-2';
  const backArrow = 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
  const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
  const formWrapper = 'w-full max-w-md space-y-6';
  const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
  const selectClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]';
  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
  const buttonPrimary = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
  const uploadFieldWrapper = 'flex items-center space-x-3';
  const uploadInputLabel = 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro';
  const uploadIconContainer = 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400';

  return (
    <div className={mainContainer}>
      <div className={headingContainer}>
        <button onClick={() => router.back()} className={backArrow} aria-label="Back">
          <FiArrowLeft size={24} />
        </button>
        <h1 className={pageTitle}>Contact Support</h1>
      </div>

      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <h2 className="mb-6 font-sfpro text-[24px] leading-[100%] tracking-[-0.05em] font-[600] text-[#1E1E1E]">
          How can DCarbon be of service today?
        </h2>
        
        <form onSubmit={handleSubmit} className={formWrapper}>
          {/* Subject Field */}
          <div>
            <label className={labelClass}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject Request"
              className={inputClass}
              required
            />
          </div>

          {/* Contact Reason Dropdown */}
          <div>
            <label className={labelClass}>
              Contact Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={selectClass}
              required
            >
              <option value="">Choose reason</option>
              <option value="Billing">Billing</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Feedback">Feedback</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Support Message */}
          <div>
            <label className={labelClass}>
              Support Message
            </label>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your issue in detail..."
              className={`${inputClass} min-h-[120px]`}
              required
            />
          </div>

          {/* Optional File Upload */}
          <div>
            <label className={labelClass}>
              Attachments (Optional)
            </label>
            <div className={uploadFieldWrapper}>
              <label className={uploadInputLabel}>
                Choose file...
                <input type="file" className="hidden" />
                <div className={uploadIconContainer}>
                  <FiUpload />
                </div>
              </label>
            </div>
            <p className="mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]">
              You can upload screenshots or documents to help us understand your issue better
            </p>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonPrimary} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardContactSupport;
