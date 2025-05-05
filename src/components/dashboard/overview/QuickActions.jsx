// src/components/QuickActions.jsx
import React, { useState } from 'react';
import {
  FiChevronDown
} from 'react-icons/fi';

export default function QuickActions() {
  const [filter, setFilter] = useState('total');

  const cards = [
    {
      key: 'totalCustomers',
      icon: '/vectors/TotalCustomers.png',
      label: 'Total Customers',
      value: '100',
    },
    {
      key: 'totalPartners',
      icon: '/vectors/Handshake.png',
      label: 'Total Partners',
      value: '100',
    },
    {
      key: 'totalFacilities',
      icon: '/vectors/TotalRegFacilities.png',
      label: 'Total Reg. Facilities',
      value: '100',
    },
    {
      key: 'recsGenerated',
      icon: '/vectors/CoinVertical.png',
      label: 'Total RECs Generated',
      value: '10',
    },
    {
      key: 'recsSold',
      icon: '/vectors/ArrowLineUpRight.png',
      label: 'Total RECs Sold',
      value: '10',
    },
  ];

  return (
    <div className="w-full py-4 px-4">
      {/* Filter dropdown */}
      <div className="flex justify-end mb-4">
        <div className="relative inline-block">
          <button
            onClick={() => {/* you can toggle a menu here if needed */}}
            className="flex items-center text-black text-sm font-semibold"
          >
            {filter === 'total' ? 'Total' : filter}
            <FiChevronDown className="ml-1 w-4 h-4" />
          </button>
          {/* If you need an actual dropdown menu, you can render it here */}
        </div>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(({ key, icon, label, value }) => (
          <div
            key={key}
            className="p-4 bg-white rounded-2xl flex flex-col"
          >
            <div className="flex items-center mb-2">
              <img
                src={icon}
                alt={label}
                className="h-6 w-6 object-contain mr-2"
              />
              <span className="text-[#1E1E1E] font-sfpro font-medium text-[14px] leading-[100%] tracking-[-0.05em]">
                {label}
              </span>
            </div>
            <hr className="border-gray-200 w-full my-2" />
            <span className="text-[#056C69] font-sfpro font-bold text-[18px] leading-tight">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
