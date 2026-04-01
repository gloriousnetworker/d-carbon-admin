"use client";
import CONFIG from '@/lib/config';
import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePasswordCard = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("User not authenticated");
      return;
    }

    const payload = {
      oldPassword,
      newPassword,
    };

    try {
      const response = await axios.post(
        `${CONFIG.API_BASE_URL}/api/auth/change-password/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      toast.success(response.data.message || "Password changed successfully");
      onClose && onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Change password failed";
      toast.error(errorMessage);
      console.error("Change Password Error:", error);
    }
  };

  const styles = {
    mainContainer: "min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white",
    modalOverlay: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
    modalContent: "relative bg-white rounded-xl shadow-xl w-full max-w-md p-6",
    pageTitle: "mb-4 font-[600] text-[24px] leading-normal tracking-[-0.05em] text-[#039994] font-sfpro text-center",
    formWrapper: "w-full max-w-md space-y-6",
    labelClass: "block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]",
    inputClass: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]",
    buttonPrimary: "w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro",
    passwordInputWrapper: "relative",
    eyeIcon: "absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500",
    forgotPasswordLink: "text-right mt-1 text-[#FBB03B] text-sm hover:underline",
    closeButton: "absolute top-2 right-2 text-gray-500 hover:text-gray-700"
  };

  return (
    <div className={styles.modalOverlay}>
      <Toaster />
      <div className={styles.modalContent}>
        <h2 className={styles.pageTitle}>
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className={styles.formWrapper}>
          <div>
            <label className={styles.labelClass}>
              Old Password
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showOldPassword ? "text" : "password"}
                className={`${styles.inputClass} pr-10`}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <div
                className={styles.eyeIcon}
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            <div className={styles.forgotPasswordLink}>
              <a href="/forgot-password">
                Forgot Password?
              </a>
            </div>
          </div>

          <div>
            <label className={styles.labelClass}>
              New Password
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showNewPassword ? "text" : "password"}
                className={`${styles.inputClass} pr-10`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div
                className={styles.eyeIcon}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`mt-4 ${styles.buttonPrimary}`}
          >
            Save
          </button>
        </form>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            X
          </button>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordCard;