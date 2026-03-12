'use client';

import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

const ProfileImage = () => {
  const defaultProfilePic = "/dashboard_images/profileImage.png";
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic);
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.dev.dcarbon.solutions/api/admin/upload-profile-picture/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success("Profile picture updated successfully");
      
      if (data.data && data.data.profilePicture) {
        setProfilePicture(data.data.profilePicture);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Error uploading image");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-200">
      <div
        className={`relative w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center ${
          isLoading ? "opacity-70" : "cursor-pointer"
        }`}
        onClick={!isLoading ? handleImageClick : undefined}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]"></div>
          </div>
        )}
        <Image
          src={profilePicture}
          alt="Profile"
          width={128}
          height={128}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultProfilePic;
          }}
        />
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <p className="mt-2 text-sm text-gray-500">
        {isLoading ? "Uploading..." : "Click to change profile picture"}
      </p>
    </div>
  );
};

export default ProfileImage;