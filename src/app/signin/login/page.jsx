"use client";

import Image from 'next/image';
import LoginCard from '@/components/signin/LoginCard';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#15104D]">
            <div className="w-full md:w-1/2">
                <Image
                    src="/signin_images/Login_image.png"
                    alt="Login Image"
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover rounded-lg"
                    priority
                />
            </div>
            <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
                <LoginCard />
            </div>
        </div>
    );
}
