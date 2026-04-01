import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import CONFIG from "../../../../lib/config";

export default function CustomerVisualizationCard() {
  const [partnerType, setPartnerType] = useState("Partner");
  const [timeFrame, setTimeFrame] = useState("Yearly");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [showTimeFrameDropdown, setShowTimeFrameDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [partnerData, setPartnerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const partnerOptions = ["Partner", "Master Partner TPO", "Customer/Solar Owner", "Sales Agent"];
  const timeFrameOptions = ["Yearly", "Monthly", "Quarterly"];
  const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    fetchPartnerUsers();
  }, []);

  useEffect(() => {
    processPartnerData();
  }, [partnerData, year, timeFrame]);

  const fetchPartnerUsers = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      let allPartnerUsers = [];
      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/get-all-users?page=${currentPage}&limit=100`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (result.status === 'success') {
          const partnerUsers = result.data.users.filter(user => user.userType === 'PARTNER');
          allPartnerUsers = [...allPartnerUsers, ...partnerUsers];
          hasNextPage = result.data.metadata.hasNextPage;
          currentPage++;
        } else {
          hasNextPage = false;
        }
      }

      setPartnerData(allPartnerUsers);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const processPartnerData = () => {
    const monthlyData = Array(12).fill(0).map((_, index) => ({
      month: MONTHS[index],
      below500k: 0,
      between500kAnd2_5m: 0,
      above2_5m: 0
    }));

    partnerData.forEach(user => {
      const userDate = new Date(user.date);
      const userYear = userDate.getFullYear().toString();
      const userMonth = userDate.getMonth();

      if (userYear === year) {
        monthlyData[userMonth].below500k += 1;
      }
    });

    const maxValue = Math.max(...monthlyData.map(m => m.below500k));
    const scaleFactor = maxValue > 100 ? 100 / maxValue : 1;

    monthlyData.forEach(month => {
      month.below500k = Math.round(month.below500k * scaleFactor);
    });

    setProcessedData(monthlyData);
  };

  const [processedData, setProcessedData] = useState([]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yAxisLabels = [0, 25, 50, 75, 100];

  const getMonthlyValue = (month) => {
    const monthData = processedData.find(d => d.month === month);
    return monthData ? monthData.below500k : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
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

        <div className="flex space-x-2">
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 animate-pulse text-xs">Loading partner data...</p>
        </div>
      ) : (
        <>
          <div className="flex">
            <div className="flex flex-col justify-between h-64 pr-2 text-sm text-gray-600">
              {yAxisLabels.reverse().map((label) => (
                <div key={label} className="text-right">
                  {label}
                </div>
              ))}
            </div>

            <div className="flex-1">
              <div className="flex h-64 justify-between">
                {months.map((month) => {
                  const value = getMonthlyValue(month);
                  return (
                    <div key={month} className="flex flex-col items-center justify-end flex-1">
                      <div 
                        className="w-14 rounded-lg overflow-hidden flex flex-col-reverse"
                        style={{ 
                          backgroundColor: "#EEEEEE",
                          height: "100%"
                        }}
                      >
                        <div 
                          className="w-full" 
                          style={{ 
                            height: `${value}%`, 
                            backgroundColor: "#FFB200",
                            borderBottomLeftRadius: "6px",
                            borderBottomRightRadius: "6px"
                          }}
                        />
                        
                        <div 
                          className="w-full" 
                          style={{ 
                            height: `0%`, 
                            backgroundColor: "#056C69" 
                          }}
                        />
                        
                        <div 
                          className="w-full" 
                          style={{ 
                            height: `0%`, 
                            backgroundColor: "#00B4AE",
                            borderTopLeftRadius: "6px",
                            borderTopRightRadius: "6px"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

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

          <div className="flex justify-end space-x-4 text-sm">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: "#FFB200" }}></div>
              <span>Partners ({partnerData.length})</span>
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
        </>
      )}
    </div>
  );
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];