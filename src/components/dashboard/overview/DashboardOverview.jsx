import React from "react";
import { TrendingUp, ShoppingCart, Clock, Users } from "lucide-react";

const MetricCard = ({ title, value, color, icon: Icon, trend }) => {
  return (
    <div className={`${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white/90 font-medium text-sm">{title}</h3>
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-white/80">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">+{trend}%</span>
          </div>
        )}
      </div>
      <div className="text-white font-bold text-3xl">{value}</div>
    </div>
  );
};

const CustomerRow = ({ name, status, date }) => {
  return (
    <div className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Active since {date}</p>
      </div>
    </div>
  );
};

export default function DashboardOverview() {
  const metrics = [
    {
      title: "Total Sales",
      value: "$12,345",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: TrendingUp,
      trend: 12
    },
    {
      title: "New Orders",
      value: "150",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      icon: ShoppingCart,
      trend: 8
    },
    {
      title: "Pending Tasks",
      value: "7",
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
      icon: Clock
    }
  ];

  const customers = [
    { name: "John Doe", status: "Premium Customer", date: "2023-01-15" },
    { name: "Jane Smith", status: "Regular Customer", date: "2023-03-20" },
    { name: "Peter Jones", status: "New Customer", date: "2023-05-10" }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600 text-lg">
            This is where your main dashboard content will go. You can add charts, statistics, and other important information here.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Customer Insights Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Customer Insights</h2>
            </div>
            <p className="text-gray-600">
              Here you can display customer-related data, such as recent sign-ups, active users, or customer feedback.
            </p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {customers.map((customer, index) => (
              <CustomerRow key={index} {...customer} />
            ))}
          </div>
          
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
              View all customers →
            </button>
          </div>
        </div>

        {/* Additional Sections Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                Create New Order
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                Generate Report
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                View Analytics
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-600 text-sm">New order received from John Doe</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-gray-600 text-sm">Payment processed successfully</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-gray-600 text-sm">Inventory alert: Low stock items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}