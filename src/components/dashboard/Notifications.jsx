"use client";

import React, { useState, useEffect } from 'react';
import { mainContainer, labelClass, buttonPrimary } from './styles';

const DashboardNotifications = () => {
  // Style constants
  const toggleButtonBase = 'relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2';
  const toggleHandleBase = 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform';
  const notificationItemBase = 'p-4 rounded-lg border border-gray-200 hover:border-[#039994] transition-colors cursor-pointer';
  const unreadNotificationStyle = 'bg-[#039994]/10 border-[#039994]';
  const notificationTimeStyle = 'text-xs text-gray-500 mt-1';

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [onScreenNotifications, setOnScreenNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  
  // Notifications data state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        
        if (!userId || !authToken) {
          throw new Error('User not authenticated');
        }

        const response = await fetch(
          `https://services.dcarbon.solutions/api/user/notifications/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data.data);
        localStorage.setItem('notifications', JSON.stringify(data.data));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/notifications/${notificationId}/mark-read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update the local state
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      );

      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      // If we're viewing the notification details, update that too
      if (selectedNotification && selectedNotification.id === notificationId) {
        setSelectedNotification({ ...selectedNotification, isRead: true });
      }

    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  // Toggle handlers
  const handleToggleEmail = () => {
    setEmailNotifications((prev) => !prev);
    // Here you would typically call an API to update user preferences
  };

  const handleToggleOnScreen = () => {
    setOnScreenNotifications((prev) => !prev);
    // Here you would typically call an API to update user preferences
  };

  const handleToggleSystem = () => {
    setSystemNotifications((prev) => !prev);
    // Here you would typically call an API to update user preferences
  };

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={mainContainer}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={mainContainer}>
        <div className="text-red-500 text-center p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className={mainContainer}>
      {selectedNotification ? (
        // Notification detail view
        <div className="w-full max-w-2xl mx-auto">
          <button 
            onClick={() => setSelectedNotification(null)}
            className="flex items-center text-[#039994] mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to notifications
          </button>
          
          <div className={`${notificationItemBase} ${!selectedNotification.isRead ? unreadNotificationStyle : ''}`}>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-[#1E1E1E]">{selectedNotification.title}</h3>
              {!selectedNotification.isRead && (
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-[#039994] text-white">
                  New
                </span>
              )}
            </div>
            <p className="mt-2 text-[#1E1E1E]">{selectedNotification.message}</p>
            
            {/* Display additional data if available */}
            {selectedNotification.data && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                {Object.entries(selectedNotification.data).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="font-medium capitalize">{key}:</span> {value}
                  </div>
                ))}
              </div>
            )}
            
            <div className={notificationTimeStyle}>
              {formatRelativeTime(selectedNotification.createdAt)}
            </div>
          </div>
        </div>
      ) : (
        // Notifications list view
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-[#1E1E1E]">Notifications</h2>
          
          {/* Notification tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-[#039994] border-b-2 border-[#039994]' : 'text-gray-500'}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'unread' ? 'text-[#039994] border-b-2 border-[#039994]' : 'text-gray-500'}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread
            </button>
          </div>
          
          {/* Notifications list */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${notificationItemBase} ${!notification.isRead ? unreadNotificationStyle : ''}`}
                  onClick={() => {
                    setSelectedNotification(notification);
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[#1E1E1E]">{notification.title}</h3>
                    {!notification.isRead && (
                      <span className="inline-block h-2 w-2 rounded-full bg-[#039994]"></span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#1E1E1E] line-clamp-2">{notification.message}</p>
                  <div className={notificationTimeStyle}>
                    {formatRelativeTime(notification.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Notification settings */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-4">Notification Settings</h3>
            <div className="space-y-4">
              {/* 1) Enable Email Notifications */}
              <div className="flex items-center justify-between">
                <span className={`${labelClass} text-gray-700`}>Enable Email Notifications</span>
                <button
                  type="button"
                  onClick={handleToggleEmail}
                  className={`${toggleButtonBase} ${emailNotifications ? 'bg-[#039994]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`${toggleHandleBase} ${emailNotifications ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {/* 2) Enable On-screen Notifications */}
              <div className="flex items-center justify-between">
                <span className={`${labelClass} text-gray-700`}>Enable On-screen Notifications</span>
                <button
                  type="button"
                  onClick={handleToggleOnScreen}
                  className={`${toggleButtonBase} ${onScreenNotifications ? 'bg-[#039994]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`${toggleHandleBase} ${onScreenNotifications ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {/* 3) Receive System Notifications */}
              <div className="flex items-center justify-between">
                <span className={`${labelClass} text-gray-700`}>Receive System Notifications</span>
                <button
                  type="button"
                  onClick={handleToggleSystem}
                  className={`${toggleButtonBase} ${systemNotifications ? 'bg-[#039994]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`${toggleHandleBase} ${systemNotifications ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardNotifications;