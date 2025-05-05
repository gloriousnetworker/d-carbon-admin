// app/layout.js
'use client';

import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { ProfileProvider } from '@/components/contexts/ProfileContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ProfileProvider>
          <Toaster position="top-center" />
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}