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
import { Loader2 } from "lucide-react";
import CONFIG from "@/lib/config";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const BRAND_COLOR = "#039994";

export default function RecSalesCharts() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loadingGenerated, setLoadingGenerated] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [generatedData, setGeneratedData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchRecGenerated();
    fetchRecSales();
  }, [year]);

  const fetchRecGenerated = async () => {
    setLoadingGenerated(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/rec/statistics?year=${year}`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      const result = await response.json();
      if (result.status === "success" && result.data) {
        const data = MONTHS.map((month, index) => {
          const monthNumber = index + 1;
          const monthData = result.data.find((item) => parseInt(item.month) === monthNumber);
          return { month, value: monthData ? monthData.count : 0 };
        });
        setGeneratedData(data);
      } else {
        setGeneratedData(MONTHS.map((month) => ({ month, value: 0 })));
      }
    } catch (error) {
      console.error("Error fetching REC generated data:", error);
      setGeneratedData(MONTHS.map((month) => ({ month, value: 0 })));
    } finally {
      setLoadingGenerated(false);
    }
  };

  const fetchRecSales = async () => {
    setLoadingSales(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/rec/statistics?year=${year}&type=sales`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      const result = await response.json();
      if (result.status === "success" && result.data) {
        const data = MONTHS.map((month, index) => {
          const monthNumber = index + 1;
          const monthData = result.data.find((item) => parseInt(item.month) === monthNumber);
          return { month, value: monthData ? monthData.count : 0 };
        });
        setSalesData(data);
      } else {
        setSalesData(MONTHS.map((month) => ({ month, value: 0 })));
      }
    } catch (error) {
      console.error("Error fetching REC sales data:", error);
      setSalesData(MONTHS.map((month) => ({ month, value: 0 })));
    } finally {
      setLoadingSales(false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* RECs Generated */}
      <div className="border border-gray-200 rounded-xl p-6 flex flex-col bg-white">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[#039994] font-sfpro">
            RECs Generated
          </h3>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs font-sfpro focus:outline-none focus:ring-1 focus:ring-[#039994]"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <hr className="my-4 border-gray-100" />

        {loadingGenerated ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
            <span className="text-xs text-gray-500 font-sfpro mt-2">Loading data...</span>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-500 font-sfpro mb-2">RECs</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={generatedData}
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
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow text-xs font-sfpro">
                          <p className="text-gray-500">{d.month}</p>
                          <p style={{ color: BRAND_COLOR }}>RECs: {d.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={BRAND_COLOR}
                  radius={[8, 8, 0, 0]}
                  background={{ fill: "#f5f5f5", radius: [8, 8, 0, 0] }}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* REC Sales Report */}
      <div className="border border-gray-200 rounded-xl p-6 flex flex-col bg-white">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[#039994] font-sfpro">
            REC Sales Report
          </h3>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs font-sfpro focus:outline-none focus:ring-1 focus:ring-[#039994]"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <hr className="my-4 border-gray-100" />

        {loadingSales ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
            <span className="text-xs text-gray-500 font-sfpro mt-2">Loading data...</span>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-500 font-sfpro mb-2">RECs Sold</div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={salesData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: "#E0E0E0" }}
                  tickLine={false}
                />
                <YAxis
                  width={30}
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: "#E0E0E0" }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`${v} RECs`, "Sold"]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={BRAND_COLOR}
                  strokeWidth={2}
                  dot={{ r: 3, fill: BRAND_COLOR }}
                  activeDot={{ r: 5, fill: BRAND_COLOR }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
