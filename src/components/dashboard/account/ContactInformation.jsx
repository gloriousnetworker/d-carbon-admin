"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ContactInformation = () => {
  const sectionHeader = "flex items-center justify-between cursor-pointer";
  const sectionTitle = "text-lg font-semibold text-[#039994] font-sfpro";
  const labelClass = "text-sm text-gray-700 mb-1 block font-sfpro";
  const inputClass =
    "border border-gray-300 rounded w-full px-3 py-2 focus:outline-none font-sfpro text-[14px] leading-[100%] tracking-[-0.05em]";
  const inputStyle = { backgroundColor: "#F0F0F0" };

  const [isOpen, setIsOpen] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  const baseUrl = "https://api.dev.dcarbon.solutions";

  useEffect(() => {
    const getUserFromStorage = () => {
      if (typeof window !== "undefined") {
        const loginResponse = localStorage.getItem("loginResponse");
        const authToken = localStorage.getItem("authToken");

        if (!loginResponse || !authToken) {
          toast.error("Authentication required");
          setLoading(false);
          return;
        }

        try {
          const parsedResponse = JSON.parse(loginResponse);
          
          if (parsedResponse.data && parsedResponse.data.admin) {
            const adminData = parsedResponse.data.admin;
            
            setUserId(adminData.id || "");
            setFirstName(adminData.firstName || "");
            setLastName(adminData.lastName || "");
            setEmail(adminData.email || "");
            setRole(adminData.role || "");
          }
        } catch (error) {
          toast.error("Failed to parse user data");
          console.error("Error parsing user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    getUserFromStorage();
  }, []);

  const handleUpdate = async () => {
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("User not authenticated");
      return;
    }

    const payload = {
      firstName,
      lastName,
      email,
    };

    try {
      await axios.put(
        `${baseUrl}/api/admin/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success("User information updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user information"
      );
      console.error("Update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={sectionTitle}>Personal Information</h2>
          {isOpen ? (
            <FaChevronUp className="text-[#039994]" size={20} />
          ) : (
            <FaChevronDown className="text-[#039994]" size={20} />
          )}
        </div>
        {isOpen && (
          <div className="mt-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <Toaster />
      <div className={sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={sectionTitle}>Personal Information</h2>
        {isOpen ? (
          <FaChevronUp className="text-[#039994]" size={20} />
        ) : (
          <FaChevronDown className="text-[#039994]" size={20} />
        )}
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="First Name"
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="Email"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Role</label>
              <input
                type="text"
                value={role}
                readOnly
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass}>User ID</label>
              <input
                type="text"
                value={userId}
                readOnly
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <button
              onClick={handleUpdate}
              className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
            >
              Update Personal Information
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInformation;