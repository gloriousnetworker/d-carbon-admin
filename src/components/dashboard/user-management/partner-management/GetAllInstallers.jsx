"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Loader,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  RefreshCw
} from "lucide-react";

export default function GetAllInstallers({ onBack }) {
  const [installers, setInstallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [metadata, setMetadata] = useState(null);

  const installersPerPage = 9; // 3x3 grid

  useEffect(() => {
    fetchInstallers();
  }, [currentPage]);

  const fetchInstallers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token from local storage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/partner/get-all-installer?page=${currentPage}&limit=${installersPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.status === "success") {
        setInstallers(response.data.data.installers || []);
        setMetadata(response.data.data.metadata || null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch installers');
      }
    } catch (err) {
      console.error('Error fetching installers:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view this data.');
      } else {
        setError(err.message || 'Failed to fetch installers');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // Helper function to format partner type
  const formatPartnerType = (type) => {
    if (!type) return "Installer";
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Helper function to get user status
  const getUserStatus = (installer) => {
    if (!installer.user) return { status: 'No Account', color: 'bg-gray-100 text-gray-700' };
    if (installer.user.isActive) return { status: 'Active', color: 'bg-green-100 text-green-700' };
    return { status: 'Inactive', color: 'bg-red-100 text-red-700' };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading installers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ArrowLeft 
            className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800 mr-4" 
            onClick={onBack}
          />
          <h1 className="text-2xl font-bold text-gray-900">Partner Installers</h1>
        </div>
        <button
          onClick={fetchInstallers}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-red-200">
              <div className="text-red-500 mb-4">
                <Mail className="h-12 w-12 mx-auto mb-2" />
                <p className="font-medium text-lg">Error Loading Installers</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
              <button 
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                onClick={fetchInstallers}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : installers.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-medium text-gray-700">No installers found</p>
              <p className="text-sm text-gray-500 mt-2">There are currently no partner installers to display.</p>
              <button 
                className="mt-4 px-4 py-2 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors"
                onClick={fetchInstallers}
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-teal-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Total Partner Installers
                    </h2>
                    <p className="text-sm text-gray-600">
                      Showing {installers.length} of {metadata?.total || 0} installers
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">
                    {metadata?.total || 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total Installers
                  </div>
                </div>
              </div>
            </div>

            {/* Installer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {installers.map((installer, index) => {
                const userStatus = getUserStatus(installer);
                return (
                  <div 
                    key={installer.id} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 h-fit"
                  >
                    {/* Header with S/N and Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-teal-50 text-teal-700 text-xs font-medium px-2 py-1 rounded">
                        #{installer.namingCode || ((currentPage - 1) * installersPerPage) + index + 1}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${userStatus.color}`}>
                        {userStatus.status}
                      </span>
                    </div>

                    {/* Name and Code */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate" title={installer.name}>
                          {truncateText(installer.name, 20)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Code: {installer.namingCode || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate" title={installer.email}>
                          {truncateText(installer.email, 25)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-700">
                          {installer.phoneNumber || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700 line-clamp-2" title={installer.address}>
                          {truncateText(installer.address, 40)}
                        </span>
                      </div>
                    </div>

                    {/* Partner Type and Date */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {formatPartnerType(installer.partnerType)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {formatDate(installer.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {metadata && metadata.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * installersPerPage) + 1} to{' '}
                    {Math.min(currentPage * installersPerPage, metadata.total)} of{' '}
                    {metadata.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={!metadata.hasPrevPage || loading}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 px-2">
                      Page {currentPage} of {metadata.totalPages}
                    </span>
                    <button
                      className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={!metadata.hasNextPage || loading}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, metadata.totalPages))}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}