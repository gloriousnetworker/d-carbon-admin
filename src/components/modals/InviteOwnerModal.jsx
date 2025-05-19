import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toastr from 'toastr';

export default function EmailVerificationModal({ closeModal }) {
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toastr.error('Authentication required. Please log in.');
      setIsSubmitting(false);
      return;
    }

    if (!email) {
      toastr.error('Please enter an email address.');
      setIsSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toastr.error('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/invite-user/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            inviteeEmail: email,
            role: 'owner'
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitation');
      }

      toastr.success(data.message || 'Invitation sent successfully');
      closeModal();
      setOwnerName('');
      setEmail('');
    } catch (error) {
      toastr.error(error.message || 'An error occurred while sending the invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl sm:w-96 md:w-1/2 lg:w-1/3 xl:w-1/4 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-center text-[#039994]">Invite Owner</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner Name Input */}
          <div>
            <label htmlFor="ownerName" className="block text-gray-700">Owner's Name</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Full name"
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E.g. name@domain.com"
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition"
            />
          </div>

          <hr className="my-4 border-t-2 border-gray-200" />

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-md text-white font-semibold transition duration-300 ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#039994] hover:bg-[#02857f]'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Email Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}