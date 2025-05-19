import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import axios from 'axios';

export default function EmailVerificationModal({ closeModal, onSkip }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    customerType: "RESIDENTIAL",
    role: "OPERATOR",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      customerType: "RESIDENTIAL",
      role: "OPERATOR",
      message: ""
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toast.error('Missing user credentials. Please log in again.');
      setLoading(false);
      return;
    }

    if (!formData.email) {
      toast.error('Please enter an email address.');
      setLoading(false);
      return;
    }

    const payload = {
      invitees: [
        {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          customerType: formData.customerType,
          role: formData.role,
          ...(formData.message && { message: formData.message })
        }
      ]
    };

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-user/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          }
        }
      );

      if (response.data.status === 'success') {
        toast.success('Invitation sent successfully!');
        resetForm();
        closeModal(); // This will trigger the next modal in the parent component
      } else {
        throw new Error(response.data.message || 'Failed to send invitation');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to send invitation'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast('You can invite operators later from your dashboard', {
      icon: 'ℹ️',
    });
    onSkip(); // Call the onSkip prop to trigger the registration modal
  };

  return (
    <div className={spinnerOverlay}>
      <div className="relative w-full max-w-md bg-white rounded-md shadow-md p-6 space-y-4">
        {/* Invite Owner Icon */}
        <div className="flex justify-center">
          <Image 
            src="/vectors/CloudArrowDown.png" // Replace with your actual image path
            alt="Invite operator"
            width={80}
            height={80}
            className="mb-2"
          />
        </div>
        
        <h2 className={modalHeading}>
          Invite a Solar Operator
        </h2>

        <form className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter operator's name"
              className={inputClass}
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E.g. name@domain.com"
              className={inputClass}
              required
            />
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="phoneNumber" className={labelClass}>
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              className={inputClass}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className={labelClass}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Add a custom message (optional)"
              className={`${inputClass} h-16 resize-none`}
            />
          </div>

          {/* Hidden Customer Type Input - since it's always "RESIDENTIAL" */}
          <input type="hidden" name="customerType" value={formData.customerType} />
          
          {/* Hidden Role Input - since it's always "OPERATOR" */}
          <input type="hidden" name="role" value={formData.role} />
        </form>

        <hr className="my-4 border-gray-200" />

        {/* Buttons - side by side */}
        <div className="flex space-x-4">
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            disabled={loading}
            className={skipButtonStyle}
          >
            Skip for Now
          </button>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={submitButtonStyle}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Style constants
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 font-sfpro';
const modalHeading = 'text-2xl font-semibold text-[#039994] text-center';
const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const selectClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]';
const skipButtonStyle = 'flex-1 py-2 rounded-md border border-[#039994] text-[#039994] hover:bg-[#f5fdfd] transition font-sfpro disabled:opacity-50';
const submitButtonStyle = 'flex-1 py-2 rounded-md text-white transition font-sfpro bg-[#039994] hover:bg-[#02857f] disabled:bg-gray-400 disabled:cursor-not-allowed';