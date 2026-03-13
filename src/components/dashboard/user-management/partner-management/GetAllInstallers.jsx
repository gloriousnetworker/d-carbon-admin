"use client";
import CONFIG from '@/lib/config';

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  RefreshCw,
  Loader2,
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
        `${CONFIG.API_BASE_URL}/api/user/partner/get-all-installer?page=${currentPage}&limit=${installersPerPage}`,
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

  return (
    <div className="min-h-screen w-full flex flex-col py-6 px-0 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button
          className="flex items-center text-[#039994] hover:text-[#02857f] text-sm font-sfpro"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Partners
        </button>
        <button
          onClick={fetchInstallers}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-[#039994] text-[#039994] rounded-md hover:bg-[#039994] hover:text-white font-sfpro transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
            <span className="text-sm text-gray-500 font-sfpro mt-3">Loading installers...</span>
          </div>
        )}
        {!loading && error && (
          <div className="py-8 px-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-red-600 font-sfpro text-sm mb-4">{error}</p>
            <button
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 font-sfpro transition-colors"
              onClick={fetchInstallers}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && installers.length === 0 && (
          <div className="py-16 text-center border border-gray-200 rounded-xl">
            <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 font-sfpro mb-4">No partner installers found.</p>
            <button
              className="px-4 py-2 border border-[#039994] text-[#039994] text-sm rounded-md hover:bg-[#039994] hover:text-white font-sfpro transition-colors"
              onClick={fetchInstallers}
            >
              Refresh
            </button>
          </div>
        )}

        {!loading && !error && installers.length > 0 && (
          <>
            {/* Summary Card */}
            <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-gradient-to-r from-[#069B960D] to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#039994] flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#1E1E1E] font-sfpro">Partner Installers</h2>
                    <p className="text-xs text-gray-500 font-sfpro mt-0.5">
                      Showing {installers.length} of {metadata?.total || 0} installers
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#039994] font-sfpro">{metadata?.total || 0}</div>
                  <div className="text-xs text-gray-500 font-sfpro">Total</div>
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
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-100 h-fit"
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
                      <div className="w-10 h-10 bg-[#039994] rounded-full flex items-center justify-center flex-shrink-0">
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sfpro font-medium bg-[#03999415] text-[#039994]">
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
              <div className="border border-gray-200 rounded-xl px-5 py-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-sfpro">
                    Showing {((currentPage - 1) * installersPerPage) + 1}–
                    {Math.min(currentPage * installersPerPage, metadata.total)} of {metadata.total}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center px-3 py-1 text-sm border border-[#039994] text-[#039994] rounded-md hover:bg-[#039994] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-sfpro"
                      disabled={!metadata.hasPrevPage || loading}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 font-sfpro px-1">
                      {currentPage} of {metadata.totalPages}
                    </span>
                    <button
                      className="flex items-center px-3 py-1 text-sm border border-[#039994] text-[#039994] rounded-md hover:bg-[#039994] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-sfpro"
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