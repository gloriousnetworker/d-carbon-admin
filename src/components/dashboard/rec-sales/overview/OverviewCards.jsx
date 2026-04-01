import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import CONFIG from '../../../../../lib/config';

export default function QuickActions() {
  const [filter, setFilter] = useState('total');
  const [stats, setStats] = useState({
    totalRecsAvailable: 0,
    totalRecsSold: 0,
    totalRecsGenerated: 0,
    currentRecPrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/rec/overview/stats`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        const body = await res.json();
        if (body.status === 'success' && body.data) {
          setStats({
            totalRecsGenerated: body.data.totalRecsGenerated,
            totalRecsSold: body.data.totalRecsSold,
            totalRecsAvailable: body.data.totalRecsAvailable,
            currentRecPrice: body.data.currentRecPrice,
          });
        } else {
          throw new Error(body.message || 'Unknown API error');
        }
      } catch (err) {
        console.error('Failed to fetch REC stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      key: 'totalRecsAvailable',
      icon: '/vectors/TotalCustomers.png',
      label: 'Available RECs',
      value: stats.totalRecsAvailable,
    },
    {
      key: 'totalRecsSold',
      icon: '/vectors/Handshake.png',
      label: 'Total RECs Sold',
      value: stats.totalRecsSold,
    },
    {
      key: 'currentRecPrice',
      icon: '/vectors/TotalRegFacilities.png',
      label: 'REC Price',
      value: `${stats.currentRecPrice}`,
    },
    {
      key: 'totalRecsGenerated',
      icon: '/vectors/CoinVertical.png',
      label: 'Total RECs Generated',
      value: stats.totalRecsGenerated,
    },
    {
      key: 'recsSold',
      icon: '/vectors/ArrowLineUpRight.png',
      label: 'Total RECs Sold',
      value: stats.totalRecsSold,
    },
  ];

  const visibleCards = cards.slice(0, 4);

  return (
    <div className="w-full py-4 px-4">
      <div className="flex justify-end mb-4">
        <div className="relative inline-block">
          <button
            onClick={() => {}}
            className="flex items-center text-black text-sm font-semibold"
          >
            {filter === 'total' ? 'Total' : filter}
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
          <span className="text-sm text-gray-500 font-sfpro mt-3">Loading overview...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8 border border-red-200 rounded-xl text-sm font-sfpro">
          Error: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleCards.map(({ key, icon, label, value }) => (
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
                <span className="text-[#1E1E1E] font-sfpro font-medium text-xs leading-[100%] tracking-[-0.05em]">
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