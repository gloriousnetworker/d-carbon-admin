"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";

const TwoFactorAuth = ({ onBack }) => {
  const [qrCode, setQrCode] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginResponse = localStorage.getItem("loginResponse");
      const token = localStorage.getItem("authToken");
      
      if (loginResponse && token) {
        try {
          const parsedResponse = JSON.parse(loginResponse);
          if (parsedResponse.data && parsedResponse.data.admin) {
            setUserId(parsedResponse.data.admin.id);
            setAuthToken(token);
          }
        } catch (error) {
          console.error("Error parsing login response:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!userId || !authToken) return;

    const getQRCode = async () => {
      try {
        const response = await fetch(
          `https://api.dev.dcarbon.solutions/api/auth/2fa/generate/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.status === "success") {
          setQrCode(data.data.qrCode);
          setCountdown(30);
          if (!countdownRef.current) {
            countdownRef.current = setInterval(() => {
              setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
            }, 1000);
          }
        } else {
          toast.error("Failed to load QR code");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading QR code");
      }
    };

    getQRCode();

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [userId, authToken]);

  const handleChange = (value, idx) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);

    if (value && idx < 5) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (!userId || !authToken) return;

    if (code.length < 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const response = await fetch(
        `https://api.dev.dcarbon.solutions/api/auth/2fa/verify/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token: code }),
        }
      );
      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success(data.message || "2FA enabled successfully!");
        setOtp(["", "", "", "", "", ""]);
        onBack();
      } else {
        toast.error(data.message || "Failed to verify 2FA code");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error verifying 2FA code");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
      <div className="w-full max-w-xl bg-white border border-gray-300 rounded-md px-4 py-6 sm:px-6 sm:py-8">
        
        <div className="flex items-center mb-2">
          <FaArrowLeft
            onClick={onBack}
            className="text-[#039994] cursor-pointer mr-3"
          />
          <h2 className="text-xl font-semibold text-left text-[#039994] font-sfpro">
            Two Factor Authentication
          </h2>
        </div>
        
        <hr className="border-t-[1px] border-[#1E1E1E] mb-4" />

        <p className="text-gray-700 text-sm mb-4">
          Please scan the QR code with your Google Authenticator app and enter
          the verification code below.
        </p>

        <div className="bg-[#F5F5F5] rounded-md border border-[#039994] p-4 mb-4">
          {qrCode ? (
            <div className="flex justify-center">
              <img
                src={qrCode}
                alt="QR Code"
                className="max-w-full h-auto"
                style={{ width: "200px", height: "200px" }}
              />
            </div>
          ) : (
            <p className="text-gray-400 text-center">Loading QR code...</p>
          )}
        </div>

        <label className="block text-[#1E1E1E] font-medium text-sm mb-2">
          Verification Code
        </label>

        <div className="flex items-center justify-between space-x-2 mb-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-12 text-center border border-gray-300 rounded focus:outline-none focus:border-[#039994] text-xl"
            />
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            className="text-[#039994] text-sm underline"
            onClick={() => {
              toast("Help is on the way!");
            }}
          >
            Do you need help?
          </button>
          <span className="italic text-sm text-[#FF0000]">
            {`0:${countdown.toString().padStart(2, "0")} secs left`}
          </span>
        </div>

        <hr className="border-t-[1px] border-[#1E1E1E] mb-4" />

        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-[#039994] text-white text-sm rounded-md hover:bg-[#02857f] focus:outline-none"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default TwoFactorAuth;