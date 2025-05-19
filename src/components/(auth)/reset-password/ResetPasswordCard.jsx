import { useState } from 'react';
import PasswordResetSuccessModal from '../../../components/modals/PasswordResetSuccessModal'; // Ensure path is correct

export default function OtpVerificationCard() {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleChangePassword = () => {
    setLoading(true); // Set loading to true when password change is triggered
    setTimeout(() => {
      setLoading(false); // Hide the loader after password change is complete
      setModalOpen(true); // Open success modal
    }, 2000); // Simulate delay for password change process
  };

  return (
    <>
      {/* Glass-Effect Card */}
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-8"
        style={{
          background:
            'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Heading */}
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Change Password
        </h2>

        {/* Thin White Line */}
        <hr className="border-t-2 border-white mb-4" />

        {/* New Password Label and Input */}
        <div className="mb-4">
          <label htmlFor="newPassword" className="text-white text-sm mb-2 block">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="** Input Password"
            className="w-full p-3 text-white bg-transparent border-2 border-[#2EBAA0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
          />
        </div>

        {/* Confirm Password Label and Input */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="text-white text-sm mb-2 block">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="** Confirm Password"
            className="w-full p-3 text-white bg-transparent border-2 border-[#2EBAA0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
          />
        </div>

        {/* Thin White Line */}
        <hr className="border-t-2 border-white mb-4" />

        {/* Change Password Button */}
        <button
          type="button"
          onClick={handleChangePassword}
          className="w-full rounded-lg bg-[#2EBAA0] text-white font-semibold py-2 hover:bg-[#27a48e] focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
        >
          Change Password
        </button>
      </div>

      {/* Show Password Reset Success Modal when password change is successful */}
      {modalOpen && (
        <PasswordResetSuccessModal
          closeModal={() => setModalOpen(false)} // Close modal function
          loading={loading} // Pass loading state to modal
        />
      )}
    </>
  );
}
