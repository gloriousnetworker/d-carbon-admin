import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomerVisualizationCard() {
  const [partnerType, setPartnerType] = useState("Partner");
  const [timeFrame, setTimeFrame] = useState("Yearly");
  const [year, setYear] = useState("2025");
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [showTimeFrameDropdown, setShowTimeFrameDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const partnerOptions = ["Partner", "Master Partner TPO", "Customer/Solar Owner", "Sales Agent"];
  const timeFrameOptions = ["Yearly", "Monthly", "Quarterly"];
  const yearOptions = ["2025", "2024", "2023"];

  // Mock data for different partner types
  const mockData = {
    Partner: {
      Jan: { below500k: 50, between500kAnd2_5m: 15, above2_5m: 10 },
      Feb: { below500k: 60, between500kAnd2_5m: 10, above2_5m: 5 },
      Mar: { below500k: 55, between500kAnd2_5m: 15, above2_5m: 10 },
      Apr: { below500k: 45, between500kAnd2_5m: 20, above2_5m: 15 },
      May: { below500k: 60, between500kAnd2_5m: 10, above2_5m: 5 },
      Jun: { below500k: 55, between500kAnd2_5m: 15, above2_5m: 10 },
      Jul: { below500k: 45, between500kAnd2_5m: 20, above2_5m: 15 },
      Aug: { below500k: 60, between500kAnd2_5m: 10, above2_5m: 5 },
      Sep: { below500k: 55, between500kAnd2_5m: 15, above2_5m: 10 },
      Oct: { below500k: 45, between500kAnd2_5m: 20, above2_5m: 15 },
      Nov: { below500k: 60, between500kAnd2_5m: 10, above2_5m: 5 },
      Dec: { below500k: 55, between500kAnd2_5m: 15, above2_5m: 10 }
    },
    "Master Partner TPO": {
      Jan: { below500k: 40, between500kAnd2_5m: 20, above2_5m: 15 },
      Feb: { below500k: 45, between500kAnd2_5m: 15, above2_5m: 10 },
      Mar: { below500k: 50, between500kAnd2_5m: 10, above2_5m: 15 },
      Apr: { below500k: 55, between500kAnd2_5m: 15, above2_5m: 10 },
      May: { below500k: 45, between500kAnd2_5m: 20, above2_5m: 15 },
      Jun: { below500k: 50, between500kAnd2_5m: 15, above2_5m: 10 },
      Jul: { below500k: 55, between500kAnd2_5m: 10, above2_5m: 15 },
      Aug: { below500k: 45, between500kAnd2_5m: 15, above2_5m: 20 },
      Sep: { below500k: 50, between500kAnd2_5m: 15, above2_5m: 10 },
      Oct: { below500k: 55, between500kAnd2_5m: 20, above2_5m: 5 },
      Nov: { below500k: 45, between500kAnd2_5m: 15, above2_5m: 20 },
      Dec: { below500k: 50, between500kAnd2_5m: 10, above2_5m: 15 }
    },
    "Customer/Solar Owner": {
      Jan: { below500k: 30, between500kAnd2_5m: 25, above2_5m: 20 },
      Feb: { below500k: 35, between500kAnd2_5m: 20, above2_5m: 15 },
      Mar: { below500k: 40, between500kAnd2_5m: 15, above2_5m: 20 },
      Apr: { below500k: 45, between500kAnd2_5m: 20, above2_5m: 15 },
      May: { below500k: 35, between500kAnd2_5m: 25, above2_5m: 20 },
      Jun: { below500k: 40, between500kAnd2_5m: 20, above2_5m: 15 },
      Jul: { below500k: 45, between500kAnd2_5m: 15, above2_5m: 20 },
      Aug: { below500k: 35, between500kAnd2_5m: 20, above2_5m: 25 },
      Sep: { below500k: 40, between500kAnd2_5m: 25, above2_5m: 15 },
      Oct: { below500k: 45, between500kAnd2_5m: 20, above2_5m: 15 },
      Nov: { below500k: 35, between500kAnd2_5m: 15, above2_5m: 30 },
      Dec: { below500k: 40, between500kAnd2_5m: 20, above2_5m: 20 }
    },
    "Sales Agent": {
      Jan: { below500k: 60, between500kAnd2_5m: 10, above2_5m: 5 },
      Feb: { below500k: 65, between500kAnd2_5m: 8, above2_5m: 7 },
      Mar: { below500k: 55, between500kAnd2_5m: 12, above2_5m: 8 },
      Apr: { below500k: 60, between500kAnd2_5m: 15, above2_5m: 5 },
      May: { below500k: 65, between500kAnd2_5m: 10, above2_5m: 5 },
      Jun: { below500k: 60, between500kAnd2_5m: 8, above2_5m: 12 },
      Jul: { below500k: 55, between500kAnd2_5m: 15, above2_5m: 10 },
      Aug: { below500k: 60, between500kAnd2_5m: 10, above2_5m: 10 },
      Sep: { below500k: 65, between500kAnd2_5m: 12, above2_5m: 3 },
      Oct: { below500k: 60, between500kAnd2_5m: 15, above2_5m: 5 },
      Nov: { below500k: 55, between500kAnd2_5m: 10, above2_5m: 15 },
      Dec: { below500k: 60, between500kAnd2_5m: 8, above2_5m: 12 }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Always show data even when loading by using the mock data immediately
        setCustomerData(mockData[partnerType]);
        
        // Simulate API call with timeout for when real data would be fetched
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [partnerType, timeFrame, year]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yAxisLabels = [0, 25, 50, 75, 100];

  // Calculate total height of each bar (for scaling purposes)
  const getMaxTotal = () => {
    if (!customerData) return 100; // Default max
    
    let max = 0;
    months.forEach(month => {
      if (customerData[month]) {
        const total = 
          customerData[month].below500k + 
          customerData[month].between500kAnd2_5m + 
          customerData[month].above2_5m;
        if (total > max) max = total;
      }
    });
    
    return max > 100 ? max : 100; // Ensure we have at least 100 as max for scaling
  };

  const maxTotal = getMaxTotal();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col w-full">
      {/* Header with dropdowns */}
      <div className="flex justify-between items-center mb-4">
        {/* Partner dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPartnerDropdown(!showPartnerDropdown)}
            className="flex items-center justify-between text-lg font-medium text-teal-500"
            style={{ color: "#039994" }}
          >
            {partnerType}
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
          
          {showPartnerDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md z-10 w-48">
              {partnerOptions.map((option) => (
                <div
                  key={option}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setPartnerType(option);
                    setShowPartnerDropdown(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time frame and year dropdowns */}
        <div className="flex space-x-2">
          {/* Time frame dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTimeFrameDropdown(!showTimeFrameDropdown)}
              className="flex items-center justify-between px-4 py-1 bg-gray-100 rounded-md"
              style={{ backgroundColor: "#F1F1F1" }}
            >
              {timeFrame}
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            
            {showTimeFrameDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md z-10 w-32">
                {timeFrameOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setTimeFrame(option);
                      setShowTimeFrameDropdown(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Year dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex items-center justify-between px-4 py-1 bg-gray-100 rounded-md"
              style={{ backgroundColor: "#F1F1F1" }}
            >
              {year}
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            
            {showYearDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md z-10 w-24">
                {yearOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setYear(option);
                      setShowYearDropdown(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="border-gray-300 w-full mb-6" />

      {/* Chart area with y-axis labels and chart */}
      <div className="flex">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between h-64 pr-2 text-sm text-gray-600">
          {yAxisLabels.reverse().map((label) => (
            <div key={label} className="text-right">
              {label}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1">
          <div className="flex h-64 justify-between">
        {/* Month data columns */}
            {months.map((month) => (
              <div key={month} className="flex flex-col items-center justify-end flex-1">
                <div 
                  className="w-14 rounded-lg overflow-hidden flex flex-col-reverse"
                  style={{ 
                    backgroundColor: "#EEEEEE",
                    height: "100%"
                  }}
                >
                  {/* Below $500k - Yellow (at the bottom) */}
                  <div 
                    className="w-full" 
                    style={{ 
                      height: `50%`, 
                      backgroundColor: "#FFB200",
                      borderBottomLeftRadius: "6px",
                      borderBottomRightRadius: "6px"
                    }}
                  />
                  
                  {/* $500k-$2.5M - Dark Teal (middle) */}
                  <div 
                    className="w-full" 
                    style={{ 
                      height: `25%`, 
                      backgroundColor: "#056C69" 
                    }}
                  />
                  
                  {/* Above $2.5M - Light Teal (top) */}
                  <div 
                    className="w-full" 
                    style={{ 
                      height: `25%`, 
                      backgroundColor: "#00B4AE",
                      borderTopLeftRadius: "6px",
                      borderTopRightRadius: "6px"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* X-axis month labels */}
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            {months.map((month) => (
              <div key={month} className="text-center px-2">
                {month}
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-gray-300 w-full my-4" />

      {/* Legend */}
      <div className="flex justify-end space-x-4 text-sm">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#FFB200" }}></div>
          <span>&lt;$500k</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#056C69" }}></div>
          <span>$500k-$2.5M</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#00B4AE" }}></div>
          <span>&gt;$2.5M</span>
        </div>
      </div>
    </div>
  );
}