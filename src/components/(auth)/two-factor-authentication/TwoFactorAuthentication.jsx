"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Loader from "../../loader/Loader";
import toast from "react-hot-toast";

// Local style constants
const mainContainer =
  "min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white";
const headingContainer =
  "relative w-full flex flex-col items-center mb-2";
const backArrow =
  "absolute left-4 top-0 text-[#039994] cursor-pointer z-10";
const pageTitle =
  "mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center";
const formWrapper = "w-full max-w-md space-y-6";
const buttonPrimary =
  "w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro";
const spinnerOverlay =
  "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20";

export default function TwoFactorAuthentication() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  // Start a continuous 30-sec countdown when the component mounts.
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle OTP changes; only allow one numeric character per box.
  const handleOtpChange = (e, index) => {
    if (/^\d*$/.test(e.target.value)) {
      const value = e.target.value.slice(-1);
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Auto focus the next input if available
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace to move to the previous input if current box is empty.
  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Common routing function (similar logic as your login card)
  const routeUser = (user, token) => {
    if (token) {
      localStorage.setItem("authToken", token);
    }
    localStorage.setItem("userFirstName", user.firstName);
    localStorage.setItem("userProfilePicture", user.profilePicture || "");
    localStorage.setItem("userId", user.id);

    const financeDetailsIncomplete =
      user.financialInfo === null || user.agreements === null;

    if (user.userType === "COMMERCIAL") {
      if (financeDetailsIncomplete) {
        window.location.href = "/register/commercial-user-registration";
      } else {
        window.location.href = "/commercial-dashboard";
      }
    } else if (user.userType === "RESIDENTIAL") {
      if (financeDetailsIncomplete) {
        window.location.href =
          "/register/residence-user-registration/step-one";
      } else {
        window.location.href = "/residence-dashboard";
      }
    } else if (user.userType === "PARTNER") {
      if (financeDetailsIncomplete) {
        window.location.href = "/register/partner-user-registration/step-one";
      } else {
        window.location.href = "/partner-dashboard";
      }
    } else {
      window.location.href = "/dashboard";
    }
  };

  // Send the OTP verification request to your backend.
  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    // Retrieve the userId and temporary token from localStorage.
    const userId = localStorage.getItem("userId");
    const tempToken = localStorage.getItem("tempToken");

    if (!userId || !tempToken) {
      toast.error("Missing authentication data. Please try logging in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://services.dcarbon.solutions/api/auth/verify-2fa-login",
        {
          userId,
          token: enteredOtp,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );

      if (response.data.status === "success") {
        toast.success(response.data.message || "2FA verification successful");
        const { user, token } = response.data.data;
        routeUser(user, token);
      } else {
        toast.error(response.data.message || "2FA verification failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={mainContainer}>
      {loading && (
        <div className={spinnerOverlay}>
          <Loader />
        </div>
      )}

      {/* Header with Back Arrow and Title */}
      <div className={headingContainer}>
        <button onClick={() => window.history.back()} className={backArrow}>
          &#8592;
        </button>
        <h2 className={pageTitle}>Two Factor Authentication</h2>
        <hr className="border-t-[1px] border-[#1E1E1E] w-full mt-2" />
      </div>

      {/* Form Area */}
      <div className={formWrapper}>
        <p className="text-[14px] font-sfpro text-[#1E1E1E]">
          Please enter the 6-digit authentication code sent to your device.
        </p>

        {/* OTP Input Boxes */}
        <div className="flex justify-between mb-4">
          {otp.map((value, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={value}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="w-12 h-12 text-center bg-transparent border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#039994] text-[18px] font-sfpro"
              placeholder="-"
            />
          ))}
        </div>

        {/* Assistance and Countdown Timer */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[14px] font-sfpro text-[#1E1E1E]">
            Do you need help?
          </span>
          <span className="text-[14px] italic font-sfpro text-[#FF0000]">
            {countdown > 0
              ? `0:${countdown.toString().padStart(2, "0")} secs left`
              : "Time expired"}
          </span>
        </div>

        <hr className="border-t-[1px] border-[#1E1E1E]" />

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className={`${buttonPrimary} mt-4 w-auto`}
        >
          Verify
        </button>
      </div>
    </div>
  );
}
