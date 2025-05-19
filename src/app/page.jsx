'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  }, []);

  useEffect(() => {
    if (loading) {
      const timeline = gsap.timeline({ repeat: -1, yoyo: true });

      timeline.to('.construction-arm', {
        rotation: '+=10',
        transformOrigin: 'center center',
        duration: 1,
        ease: 'power1.inOut',
      });

      timeline.to(
        '.construction-head',
        {
          scale: 1.1,
          duration: 0.6,
          ease: 'bounce.out',
          yoyo: true,
          repeat: 1,
        },
        0
      );
    }
  }, [loading]);

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen bg-[#039994] flex flex-col justify-center items-center text-white">
      <button
        onClick={handleSignIn}
        className="absolute top-6 right-6 bg-white text-[#039994] font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
      >
        Sign In
      </button>

      <div className="text-center">
        <h1 className="text-5xl font-extrabold mb-6 animate__animated animate__fadeInUp animate__delay-1s">
          DCARBON
        </h1>
        <p className="text-xl max-w-3xl mx-auto mb-8 animate__animated animate__fadeInUp animate__delay-1.5s">
          SUSTAINABLE INNOVATION
        </p>
        {loading ? (
          <div className="flex items-center justify-center space-x-4 animate__animated animate__fadeInUp animate__delay-2s">
            <svg
              className="w-24 h-24"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="50" r="30" fill="yellow" stroke="#fff" strokeWidth="3" />
              <rect
                className="construction-arm"
                x="70"
                y="70"
                width="15"
                height="40"
                fill="white"
              />
              <rect
                className="construction-arm"
                x="115"
                y="70"
                width="15"
                height="40"
                fill="white"
              />
              <line x1="85" y1="110" x2="85" y2="150" stroke="white" strokeWidth="5" />
              <line x1="115" y1="110" x2="115" y2="150" stroke="white" strokeWidth="5" />
              <rect
                className="construction-tool"
                x="50"
                y="120"
                width="10"
                height="30"
                fill="gray"
                transform="rotate(45 55 130)"
              />
              <circle className="construction-head" cx="100" cy="50" r="5" fill="#fff" />
            </svg>
            <span className="text-lg font-semibold text-white">Under Construction</span>
          </div>
        ) : (
          <p className="text-lg font-semibold animate__animated animate__fadeInUp animate__delay-2.5s">
            Coming Soon
          </p>
        )}

        <div className="mt-8 flex flex-col items-center space-y-2 animate__animated animate__fadeInUp animate__delay-3s">
          <div className="text-3xl font-semibold text-white">
            We&apos;re Building Something Amazing!
          </div>
          <p className="text-lg text-white opacity-80">
            We&apos;re working hard to bring you the best experience. Stay tuned for updates.
          </p>
        </div>

        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-dot-1" />
          <div className="w-2 h-2 bg-white rounded-full animate-dot-2" />
          <div className="w-2 h-2 bg-white rounded-full animate-dot-3" />
        </div>
      </div>
    </div>
  );
}
