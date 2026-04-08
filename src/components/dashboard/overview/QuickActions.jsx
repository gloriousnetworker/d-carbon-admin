import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import CONFIG from '@/lib/config';

export default function QuickActions() {
  const router = useRouter();
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
          router.push('/login');
          return;
        }

        const response = await axios.get(`${CONFIG.API_BASE_URL}/api/admin/analytics`, {
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
        router.push('/login');
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
            <ChevronDown className="ml-1 h-3 w-3" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
          <span className="text-sm text-gray-500 font-sfpro mt-3">Loading analytics...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 border border-red-200 rounded-xl">{error}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {getCardsData().map(({ key, icon, label, value }) => (
            <div
              key={key}
              className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col"
            >
              <div className="flex items-center mb-2">
                <img
                  src={icon}
                  alt={label}
                  className="h-6 w-6 object-contain mr-2"
                />
                <span className="text-[#1E1E1E] font-sfpro font-medium text-xs leading-[100%] tracking-[-0.05em] truncate">
                  {label}
                </span>
              </div>
              <hr className="border-gray-200 w-full my-2" />
              <span className="text-[#039994] font-sfpro font-bold text-xl leading-tight">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}