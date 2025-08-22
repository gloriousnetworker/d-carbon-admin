import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiLoader } from 'react-icons/fi';
import axios from 'axios';

export default function QuickActions() {
  const [filter, setFilter] = useState('total');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
          window.location.href = '/login';
          return;
        }

        const response = await axios.get('https://services.dcarbon.solutions/api/admin/analytics', {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        setAnalytics(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to fetch analytics data');
        localStorage.clear();
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getCardsData = () => {
    if (!analytics) return [];

    return [
      {
        key: 'totalUsers',
        icon: '/vectors/TotalCustomers.png',
        label: 'Total Customers',
        value: analytics.totalUsers || '0',
      },
      {
        key: 'totalPartners',
        icon: '/vectors/Handshake.png',
        label: 'Total Partners',
        value: analytics.totalPartners || '0',
      },
      {
        key: 'totalFacilities',
        icon: '/vectors/TotalRegFacilities.png',
        label: 'Total Facilities',
        value: analytics.totalFacilities || '0',
      },
      {
        key: 'totalCommercialFacilities',
        icon: '/vectors/TotalCustomers.png',
        label: 'Commercial Facilities',
        value: analytics.totalCommercialFacilities || '0',
      },
      {
        key: 'totalResidentialFacilities',
        icon: '/vectors/TotalCustomers.png',
        label: 'Residential Facilities',
        value: analytics.totalResidentialFacilities || '0',
      },
      {
        key: 'totalRecGenerated',
        icon: '/vectors/CoinVertical.png',
        label: 'Total RECs Generated',
        value: analytics.totalRecGenerated || '0',
      },
      {
        key: 'commercialRecGenerated',
        icon: '/vectors/TotalCustomers.png',
        label: 'Commercial RECs',
        value: analytics.commercialRecGenerated || '0',
      },
      {
        key: 'residentialRecGenerated',
        icon: '/vectors/TotalCustomers.png',
        label: 'Residential RECs',
        value: analytics.residentialRecGenerated || '0',
      },
    ];
  };

  return (
    <div className="w-full py-3 px-3">
      <div className="flex justify-end mb-3">
        <div className="relative inline-block">
          <button
            className="flex items-center text-black text-xs font-semibold"
          >
            {filter === 'total' ? 'Total' : filter}
            <FiChevronDown className="ml-1 w-3 h-3" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <FiLoader className="animate-spin h-6 w-6 text-[#056C69]" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {getCardsData().map(({ key, icon, label, value }) => (
            <div
              key={key}
              className="p-2 bg-white rounded-xl flex flex-col"
            >
              <div className="flex items-center mb-1">
                <img
                  src={icon}
                  alt={label}
                  className="h-4 w-4 object-contain mr-1"
                />
                <span className="text-[#1E1E1E] font-sfpro font-medium text-[11px] leading-[100%] tracking-[-0.05em] truncate">
                  {label}
                </span>
              </div>
              <hr className="border-gray-200 w-full my-1" />
              <span className="text-[#056C69] font-sfpro font-bold text-[14px] leading-tight">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}