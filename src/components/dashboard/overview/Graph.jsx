import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChevronDown, Users, Handshake, Building2, Zap } from "lucide-react";
import Image from "next/image";
import CONFIG from "@/lib/config";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const BRAND_COLOR = "#039994";

const STAT_CONFIG = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    color: "#039994",
    bg: "#e6f7f7",
  },
  {
    key: "totalFacilities",
    label: "Total Facilities",
    icon: Building2,
    color: "#f59e0b",
    bg: "#fef3c7",
  },
  {
    key: "totalRecGenerated",
    label: "RECs Generated",
    icon: Zap,
    color: "#8b5cf6",
    bg: "#ede9fe",
  },
  {
    key: "commercialRecGenerated",
    label: "Commercial RECs",
    icon: Building2,
    color: "#ec4899",
    bg: "#fce7f3",
  },
  {
    key: "residentialRecGenerated",
    label: "Residential RECs",
    icon: Handshake,
    color: "#10b981",
    bg: "#d1fae5",
  },
];

// Custom donut label
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
  if (value === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {value}
    </text>
  );
};

export default function DashboardCharts() {
  const [salesYear, setSalesYear] = useState(new Date().getFullYear().toString());
  const [salesMonth, setSalesMonth] = useState("1");
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingSalesData, setLoadingSalesData] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    fetchRecStatistics();
  }, [salesYear, salesMonth]);

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.status === "success") {
        setAnalyticsData(result.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchRecStatistics = async () => {
    setLoadingSalesData(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/rec/statistics?year=${salesYear}&month=${salesMonth}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.status === "success" && result.data && result.data.length > 0) {
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
      console.error("Error fetching REC statistics:", error);
      setSalesData(MONTHS.map((month) => ({ month, value: 0 })));
    } finally {
      setLoadingSalesData(false);
    }
  };

  // Build pie chart data from analytics
  const getPieData = () => {
    if (!analyticsData) return [];
    const segments = [
      { name: "Users", value: analyticsData.totalUsers || 0, color: "#039994" },
      { name: "Comm. Facilities", value: analyticsData.totalCommercialFacilities || 0, color: "#f59e0b" },
      { name: "Resi. Facilities", value: analyticsData.totalResidentialFacilities || 0, color: "#10b981" },
      { name: "Commercial RECs", value: analyticsData.commercialRecGenerated || 0, color: "#ec4899" },
      { name: "Residential RECs", value: analyticsData.residentialRecGenerated || 0, color: "#8b5cf6" },
    ];
    // Filter out zeros for cleaner pie
    return segments.filter((s) => s.value > 0);
  };

  const pieData = getPieData();
  const hasAnyData = pieData.length > 0;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── LEFT: Analytics Overview ── */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-semibold" style={{ color: BRAND_COLOR }}>
            Platform Overview
          </h3>
          <span className="text-xs text-gray-400">All-time totals</span>
        </div>

        <hr className="my-4" />

        {loadingAnalytics ? (
          <div className="flex-1 flex items-center justify-center h-[300px]">
            <p className="text-gray-400 animate-pulse text-xs">Loading analytics...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
                <div
                  key={key}
                  className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ backgroundColor: bg }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color + "22" }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-none mb-1">{label}</p>
                    <p className="text-xl font-bold leading-none" style={{ color }}>
                      {analyticsData?.[key] ?? 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Donut Chart */}
            <div className="flex flex-col items-center mt-2">
              {hasAnyData ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
                    {pieData.map((entry, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        {entry.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-xs text-gray-400">
                  No distribution data available yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: REC Statistics ── */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex justify-between items-center">
          <h3
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: BRAND_COLOR }}
          >
            <div className="w-5 h-5 relative">
              <Image
                src="/vectors/ChartLineUp.png"
                alt="REC Icon"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            REC Statistics
          </h3>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-600 font-medium">
              Total: {analyticsData?.totalRecGenerated || 0}
            </span>
            <select
              value={salesMonth}
              onChange={(e) => setSalesMonth(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
            >
              {MONTHS.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={salesYear}
              onChange={(e) => setSalesYear(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className="my-4" />

        {/* REC Breakdown Cards */}
        {!loadingAnalytics && analyticsData && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl px-4 py-3 bg-pink-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Building2 size={16} className="text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Commercial</p>
                <p className="text-xl font-bold text-pink-500">
                  {analyticsData.commercialRecGenerated || 0}
                </p>
              </div>
            </div>
            <div className="rounded-xl px-4 py-3 bg-emerald-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Handshake size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Residential</p>
                <p className="text-xl font-bold text-emerald-500">
                  {analyticsData.residentialRecGenerated || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {loadingSalesData ? (
          <div className="flex-1 flex items-center justify-center h-[200px]">
            <p className="text-gray-400 animate-pulse text-xs">Loading REC data...</p>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-500 mb-2">Monthly REC Distribution</div>
            {salesData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
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
                    formatter={(v) => [`${v} RECs`, "Count"]}
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
            ) : (
              <div className="flex-1 flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <Zap size={32} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-gray-400 text-xs">No REC data available for this period</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}