"use client";

import { Suspense } from 'react';
import RegisterCard from '../../../components/(auth)/register/RegisterCard';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF]">
      {/* Left Section - Image */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <img
          src="/auth_images/Register_image.png" 
          alt="Login Image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Login Card */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <Suspense fallback={<div>Loading...</div>}>
          <RegisterCard />
        </Suspense>
      </div>
    </div>
  );
}