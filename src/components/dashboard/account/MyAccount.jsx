"use client";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import TwoFactorAuth from "./TwoFactorAuth";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileImage from "./ProfileImage";
import ContactInformation from "./ContactInformation";
import Loader from "@/components/loader/Loader";

const MyAccount = () => {
  const [showPreferences, setShowPreferences] = useState(true);
  const [viewTwoFA, setViewTwoFA] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAdminData = () => {
      if (typeof window !== "undefined") {
        const userId = localStorage.getItem("userId");
        if (userId) {
          setAdminData({
            id: userId,
            firstName: localStorage.getItem("userFirstName") || "",
            lastName: localStorage.getItem("userLastName") || "",
            email: localStorage.getItem("userEmail") || "",
            role: localStorage.getItem("userRole") || "",
            profilePicture: localStorage.getItem("userProfilePicture") || "",
          });
        }
        setLoading(false);
      }
    };

    getAdminData();
  }, []);

  if (viewTwoFA) {
    return <TwoFactorAuth onBack={() => setViewTwoFA(false)} />;
  }

  return (
    <>
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}

      <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row border border-[#E8E8E8] relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl z-10">
                <Loader />
              </div>
            )}

            <ProfileImage />

            <div className="w-full md:w-2/3 md:pl-8 space-y-6">
              {!loading && (
                <>
                  <ContactInformation />
                  
                  <div className="border-t border-[#E8E8E8] pt-6">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setShowPreferences(!showPreferences)}
                    >
                      <h2 className="text-lg font-semibold text-[#039994] font-sfpro">
                        Preferences
                      </h2>
                      {showPreferences ? (
                        <FaChevronUp className="text-[#039994]" size={20} />
                      ) : (
                        <FaChevronDown className="text-[#039994]" size={20} />
                      )}
                    </div>
                    {showPreferences && (
                      <div className="mt-4 space-y-4">
                        <button
                          className="text-sm text-[#1E1E1E] hover:text-[#039994] focus:outline-none block font-sfpro transition-colors"
                          onClick={() => setViewTwoFA(true)}
                        >
                          2FA Authentication
                        </button>

                        <button
                          className="text-sm text-[#1E1E1E] hover:text-[#039994] focus:outline-none block font-sfpro transition-colors"
                          onClick={() => setShowChangePasswordModal(true)}
                        >
                          Change Password
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccount;