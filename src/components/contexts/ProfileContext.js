// app/contexts/ProfileContext.js
'use client';
import CONFIG from '@/lib/config';

import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFromStorage = () => {
    const storedPic = localStorage.getItem('userProfilePicture');
    const storedName = localStorage.getItem('userFirstName');
    setProfile({ picture: storedPic || null, firstName: storedName || 'User' });
    setLoading(false);
  };

  const updateProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (!userId || !authToken) {
        loadFromStorage();
        return;
      }

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/user/get-one-user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        loadFromStorage();
        return;
      }

      const data = await response.json();

      if (data.status === 'success' && data.data) {
        const newProfile = {
          picture: data.data.profilePicture || null,
          firstName: data.data.firstName || 'User'
        };
        setProfile(newProfile);
        localStorage.setItem('userProfilePicture', newProfile.picture || '');
        localStorage.setItem('userFirstName', newProfile.firstName);
      }
    } catch {
      loadFromStorage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load from localStorage immediately — no API call on init to avoid
    // 404s for admin users who are not in the regular /api/user endpoint.
    loadFromStorage();
  }, []);

  const value = {
    profile: profile || { picture: null, firstName: 'User' },
    updateProfile,
    loading,
    error
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};