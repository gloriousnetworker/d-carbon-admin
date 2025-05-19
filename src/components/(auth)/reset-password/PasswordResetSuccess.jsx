import { useState } from 'react';
import Loader from '../../../components/loader/Loader';

export default function PasswordResetSuccess() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard'; // Example redirect
    }, 3000);
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}

      {/* Full-Screen Gradient Background */}
      
        {/* Glass-Effect Card */}
        <div
          className="w-full max-w-md rounded-xl shadow-lg p-8"
          style={{
            background:
              'linear-gradient(140.06deg, rgba(89, 89, 89, 0.4) -3.08%, rgba(255, 255, 255, 0.4) 106.56%)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            {/* Replace /logo.png with your actual path */}
            <img
              src="/auth_images/Login_logo.png"
              alt="DCarbon Logo"
              className="h-10 object-contain"
            />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Welcome back to DCarbon
          </h2>

          {/* Form */}
          <form>
            {/* Email Field */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="e.g. name@domain.com"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password + Forgot Password */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white"
                >
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-white hover:underline"
                >
                  Forgot password
                </a>
              </div>
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full rounded-lg bg-[#2EBAA0] text-white font-semibold py-2 hover:bg-[#27a48e] focus:outline-none focus:ring-2 focus:ring-[#2EBAA0]"
            >
              Sign in
            </button>
          </form>

          {/* Create Account */}
          <p className="mt-6 text-center text-white">
            Don’t have an account?{' '}
            <a
              href="/register"
              className="text-[#2EBAA0] hover:underline font-medium"
            >
              Create account
            </a>
          </p>

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-center text-white leading-tight">
            By clicking on ‘Sign in’, you agree to our{' '}
            <a
              href="/terms"
              className="text-[#2EBAA0] hover:underline font-medium"
            >
              Terms and Conditions
            </a>{' '}
            &{' '}
            <a
              href="/privacy"
              className="text-[#2EBAA0] hover:underline font-medium"
            >
              Privacy Policy
            </a>
          </p>
        </div>
    </>
  );
}
