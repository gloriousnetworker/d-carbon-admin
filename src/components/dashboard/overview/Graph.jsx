import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Color constants
const COLORS = {
  customers: "#039994",
  salesReport: "#1E1E1E",
  recsGenerated: "#4CAF50",
  partners: "#FF9800",
  resiGroups: "#9C27B0",
};

export default function DashboardCharts() {
  // State for view controls
  const [leftChartView, setLeftChartView] = useState("Yearly");
  const [leftChartYear, setLeftChartYear] = useState(new Date().getFullYear().toString());
  const [salesYear, setSalesYear] = useState(new Date().getFullYear().toString());
  
  // State for data loading
  const [loadingLeftChartData, setLoadingLeftChartData] = useState(true);
  const [loadingSalesData, setLoadingSalesData] = useState(true);
  
  // State for display type
  const [displayType, setDisplayType] = useState("Customers");
  
  // State for chart data
  const [customersData, setCustomersData] = useState([]);
  const [recsGeneratedData, setRecsGeneratedData] = useState([]);
  const [partnersData, setPartnersData] = useState([]);
  const [resiGroupsData, setResiGroupsData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Generate left chart data
  useEffect(() => {
    setLoadingLeftChartData(true);
    
    // Generate realistic data for different metrics
    setTimeout(() => {
      // Customers data
      const customers = MONTHS.map((month, index) => {
        const monthIndex = index;
        let value = 50 + Math.sin((monthIndex / 11) * Math.PI * 2) * 30;
        value += Math.floor(Math.random() * 15);
        return {
          month,
          value: Math.max(0, Math.min(100, Math.floor(value))),
        };
      });
      setCustomersData(customers);
      
      // RECs Generated data
      const recsData = MONTHS.map((month, index) => {
        const monthIndex = index;
        let value = 60 + Math.cos((monthIndex / 11) * Math.PI * 2) * 25;
        value += Math.floor(Math.random() * 10);
        return {
          month,
          value: Math.max(0, Math.min(100, Math.floor(value))),
        };
      });
      setRecsGeneratedData(recsData);
      
      // Partners data
      const partners = MONTHS.map((month, index) => {
        const monthIndex = index;
        let value = 40 + Math.sin((monthIndex / 11) * Math.PI * 1.5) * 35;
        value += Math.floor(Math.random() * 12);
        return {
          month,
          value: Math.max(0, Math.min(100, Math.floor(value))),
        };
      });
      setPartnersData(partners);
      
      // Residential Groups data
      const resiGroups = MONTHS.map((month, index) => {
        const monthIndex = index;
        let value = 30 + Math.cos((monthIndex / 11) * Math.PI * 1.8) * 30;
        value += Math.floor(Math.random() * 8);
        return {
          month,
          value: Math.max(0, Math.min(100, Math.floor(value))),
        };
      });
      setResiGroupsData(resiGroups);
      
      setLoadingLeftChartData(false);
    }, 600);
  }, [leftChartYear, leftChartView]);

  // Generate sales data
  useEffect(() => {
    setLoadingSalesData(true);
    
    // Generate realistic sales data
    setTimeout(() => {
      const data = MONTHS.map((month, index) => {
        // Pattern with peaks and valleys
        let value;
        
        switch (month) {
          case "Jan": value = 20; break;
          case "Feb": value = 35; break;
          case "Mar": value = 45; break;
          case "Apr": value = 30; break;
          case "May": value = 65; break;
          case "Jun": value = 50; break;
          case "Jul": value = 75; break;
          case "Aug": value = 60; break;
          case "Sep": value = 85; break;
          case "Oct": value = 90; break;
          case "Nov": value = 95; break;
          case "Dec": value = 70; break;
          default: value = 50;
        }
        
        // Add some randomness
        value += Math.floor(Math.random() * 10) - 5;
        
        return {
          month,
          value: Math.max(0, Math.min(100, value))
        };
      });
      
      setSalesData(data);
      setLoadingSalesData(false);
    }, 600);
  }, [salesYear]);

  // Get current chart data based on selected display type
  const getCurrentChartData = () => {
    switch (displayType) {
      case "Customers":
        return customersData;
      case "RECs Generated":
        return recsGeneratedData;
      case "Partners":
        return partnersData;
      case "Resi Groups":
        return resiGroupsData;
      default:
        return customersData;
    }
  };

  // Get current chart color based on selected display type
  const getCurrentChartColor = () => {
    switch (displayType) {
      case "Customers":
        return COLORS.customers;
      case "RECs Generated":
        return COLORS.recsGenerated;
      case "Partners":
        return COLORS.partners;
      case "Resi Groups":
        return COLORS.resiGroups;
      default:
        return COLORS.customers;
    }
  };

  // Get current chart unit based on selected display type
  const getCurrentChartUnit = () => {
    switch (displayType) {
      case "Customers":
        return "Customers";
      case "RECs Generated":
        return "RECs";
      case "Partners":
        return "Partners";
      case "Resi Groups":
        return "Groups";
      default:
        return "";
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Select display type
  const selectDisplayType = (type) => {
    setDisplayType(type);
    setDropdownOpen(false);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Chart Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <div className="relative">
            <h3 
              className="text-lg font-semibold flex items-center cursor-pointer"
              style={{ color: getCurrentChartColor() }}
              onClick={toggleDropdown}
            >
              {displayType}
              <ChevronDown className="h-5 w-5 ml-1" />
            </h3>
            
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="py-1">
                  <div 
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectDisplayType("Customers")}
                    style={{ color: COLORS.customers }}
                  >
                    Customers
                  </div>
                  <div 
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectDisplayType("RECs Generated")}
                    style={{ color: COLORS.recsGenerated }}
                  >
                    RECs Generated
                  </div>
                  <div 
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectDisplayType("Partners")}
                    style={{ color: COLORS.partners }}
                  >
                    Partners
                  </div>
                  <div 
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectDisplayType("Resi Groups")}
                    style={{ color: COLORS.resiGroups }}
                  >
                    Resi Groups
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={leftChartView}
              onChange={(e) => setLeftChartView(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
            >
              <option>Yearly</option>
              <option>Monthly</option>
            </select>
            
            <select
              value={leftChartYear}
              onChange={(e) => setLeftChartYear(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="my-4" />

        {loadingLeftChartData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : (
          <>
            <div className="text-xs ml-2 mb-2">{getCurrentChartUnit()}</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={getCurrentChartData()} 
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow text-xs">
                          <p>Month: {data.month}</p>
                          <p style={{ color: getCurrentChartColor() }}>
                            {displayType}: {data.value} {getCurrentChartUnit()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={getCurrentChartColor()}
                  radius={[8, 8, 0, 0]}
                  background={{ fill: '#f5f5f5', radius: [8, 8, 0, 0] }}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Sales Report Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 
            className="text-lg font-semibold flex items-center"
            style={{ color: COLORS.salesReport }}
          >
            <div className="w-5 h-5 mr-2 relative">
              <Image
                src="/vectors/ChartLineUp.png"
                alt="Sales Icon"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            Sales Report
          </h3>
          
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={salesYear}
              onChange={(e) => setSalesYear(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="my-4" />

        {loadingSalesData ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 animate-pulse text-xs">Loading…</p>
          </div>
        ) : (
          <>
            <div className="text-xs mb-2">
              <div>Revenue (in thousands)</div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={salesData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={false}
                />
                <YAxis 
                  width={30}
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={false}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(v) => `$${v}k`}
                />
                <Tooltip
                  formatter={(v) => [`$${v}k`, "Revenue"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.salesReport}
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS.salesReport }}
                  activeDot={{ r: 5, fill: COLORS.salesReport }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}