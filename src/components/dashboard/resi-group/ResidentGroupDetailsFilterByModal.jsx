"use client"

import { useState } from "react"
import { X } from "lucide-react"

export default function ResidentGroupDetailsFilterByModal({ onClose, onApplyFilter }) {
  const [filters, setFilters] = useState({
    facilityName: "",
    installer: "",
    utilityProvider: "",
    financeCompany: "",
    address: "",
    status: ""
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApply = () => {
    onApplyFilter(filters)
  }

  const handleReset = () => {
    setFilters({
      facilityName: "",
      installer: "",
      utilityProvider: "",
      financeCompany: "",
      address: "",
      status: ""
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filter Facilities</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Facility Name</label>
            <input 
              type="text"
              name="facilityName" 
              value={filters.facilityName} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Installer</label>
            <input 
              type="text"
              name="installer" 
              value={filters.installer} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Utility Provider</label>
            <input 
              type="text"
              name="utilityProvider" 
              value={filters.utilityProvider} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Finance Company</label>
            <input 
              type="text"
              name="financeCompany" 
              value={filters.financeCompany} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Address</label>
            <input 
              type="text"
              name="address" 
              value={filters.address} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Status</label>
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 rounded hover:bg-gray-50"
          >
            Reset Filters
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              className="px-4 py-2 bg-[#039994] text-white rounded hover:bg-[#028984]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}