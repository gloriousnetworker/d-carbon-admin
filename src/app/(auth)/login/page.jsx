"use client";

import LoginCard from '../../../components/(auth)/login/LoginCard';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#15104D]">
      {/* Left Section - Image */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <img
          src="/auth_images/Login_image.png" // Update this to the correct image path
          alt="Login Image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Login Card */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <LoginCard />
      </div>
    </div>
  );
}
