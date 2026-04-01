"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import toast from 'react-hot-toast';
import LoginCard from '../../../components/(auth)/login/LoginCard';

function LoginPageContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reason') === 'session_expired') {
      toast.error('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
