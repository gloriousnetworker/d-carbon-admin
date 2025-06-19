"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, Upload, X } from "lucide-react"
import * as styles from "./styles"

export default function ResiGroupManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const [createMode, setCreateMode] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedResidents, setSelectedResidents] = useState([])
  const [isMainFilterOpen, setIsMainFilterOpen] = useState(false)
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false)
  const [isDetailsFilterOpen, setIsDetailsFilterOpen] = useState(false)
  const [isRemoveUsersOpen, setIsRemoveUsersOpen] = useState(false)
  const [residentialGroups, setResidentialGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  
  const totalPages = 4
  const totalKWSelected = 60
  const totalKWCapacity = 250

  // Fetch data from API
  useEffect(() => {
    fetchResidentialGroups()
  }, [])

  const fetchResidentialGroups = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch('https://services.dcarbon.solutions/api/residential-facility/groups', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch residential groups')
      }
      
      const data = await response.json()
      setResidentialGroups(data.data.groups || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching residential groups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = () => {
    setCreateMode(false)
    setSelectedGroup(null)
  }

  const handleRowClick = (group) => {
    setSelectedGroup(group)
    setCreateMode(false)
  }

  const handleBackToList = () => {
    setSelectedGroup(null)
    setCreateMode(false)
  }

  const toggleResidentSelection = (residentId) => {
    setSelectedResidents(prev => 
      prev.includes(residentId) 
        ? prev.filter(id => id !== residentId) 
        : [...prev, residentId]
    )
  }

  // Filter residential groups based on applied filters
  const filteredGroups = residentialGroups.filter(group => {
    if (!filters || Object.keys(filters).length === 0) return true
    
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      
      switch (key) {
        case 'name':
          return group.name?.toLowerCase().includes(value.toLowerCase())
        case 'wregisId':
          return group.wregisGroupId?.toLowerCase().includes(value.toLowerCase())
        case 'utilityProvider':
          return group.utilityProvider?.toLowerCase().includes(value.toLowerCase())
        case 'financeCompany':
          return group.financeCompany?.toLowerCase().includes(value.toLowerCase())
        case 'status':
          return group.status?.toLowerCase().includes(value.toLowerCase())
        default:
          return true
      }
    })
  })

  if (loading) {
    return (
      <div className={styles.spinnerOverlay}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {!createMode && !selectedGroup ? (
        <>
          <div className="flex justify-between mb-6">
            <div>
              <select className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-sm">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50"
                onClick={() => setIsMainFilterOpen(true)}
              >
                <span>Filter by</span>
                <Filter className="h-4 w-4" />
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-teal-500 text-white rounded text-sm hover:bg-teal-600"
                onClick={() => setCreateMode(true)}
              >
                <Upload className="h-4 w-4" />
                Create Resident Group
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4">
              <h2 className="text-xl font-medium text-teal-500">Residential Groups</h2>
            </div>

            {error && (
              <div className="mx-4 mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                Error: {error}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y text-xs">
                    <th className="py-2 px-3 text-left font-medium">Group Name</th>
                    <th className="py-2 px-3 text-left font-medium">WREGIS ID</th>
                    <th className="py-2 px-3 text-left font-medium">Status</th>
                    <th className="py-2 px-3 text-left font-medium">Finance Comp.</th>
                    <th className="py-2 px-3 text-left font-medium">Utility Prov.</th>
                    <th className="py-2 px-3 text-left font-medium">Total Capacity</th>
                    <th className="py-2 px-3 text-left font-medium">Facilities</th>
                    <th className="py-2 px-3 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map((group) => (
                    <tr 
                      key={group.id} 
                      className="border-b text-xs hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(group)}
                    >
                      <td className="py-2 px-3 text-teal-500">{group.name}</td>
                      <td className="py-2 px-3">{group.wregisGroupId || 'N/A'}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          group.status === 'FORMATION' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {group.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">{group.financeCompany || 'N/A'}</td>
                      <td className="py-2 px-3">{group.utilityProvider}</td>
                      <td className="py-2 px-3">{group.totalCapacity} kW</td>
                      <td className="py-2 px-3">{group.facilities?.length || 0}</td>
                      <td className="py-2 px-3">{new Date(group.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 flex items-center justify-center gap-4">
              <button
                className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm">
                {currentPage} of {totalPages}
              </span>
              <button
                className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Modal */}
          {isMainFilterOpen && (
            <ResidentGroupsFilterByModal 
              onClose={() => setIsMainFilterOpen(false)}
              onApplyFilter={(newFilters) => {
                setFilters(newFilters)
                setIsMainFilterOpen(false)
              }}
            />
          )}
        </>
      ) : createMode ? (
        <CreateNewResidentGroup 
          onBack={handleBackToList}
          onFilterOpen={() => setIsCreateFilterOpen(true)}
          onCreate={handleCreateGroup}
          totalKWSelected={totalKWSelected}
          totalKWCapacity={totalKWCapacity}
        />
      ) : selectedGroup && (
        <ResidentGroupDetails 
          group={selectedGroup}
          onBack={handleBackToList}
          onRemoveUsers={() => setIsRemoveUsersOpen(true)}
          onFilterOpen={() => setIsDetailsFilterOpen(true)}
          selectedResidents={selectedResidents}
          onSelectResident={toggleResidentSelection}
        />
      )}

      {/* Create Group Filter Modal */}
      {isCreateFilterOpen && (
        <CreateNewResidentGroupFilterByModal
          onClose={() => setIsCreateFilterOpen(false)}
          onApplyFilter={(filters) => {
            setIsCreateFilterOpen(false)
          }}
        />
      )}

      {/* Details Filter Modal */}
      {isDetailsFilterOpen && (
        <ResidentGroupDetailsFilterByModal
          onClose={() => setIsDetailsFilterOpen(false)}
          onApplyFilter={(filters) => {
            setIsDetailsFilterOpen(false)
          }}
        />
      )}

      {/* Remove Users Modal */}
      {isRemoveUsersOpen && (
        <RemoveUsersModal
          onClose={() => setIsRemoveUsersOpen(false)}
          onConfirm={(usersToRemove) => {
            setIsRemoveUsersOpen(false)
            setSelectedResidents([])
          }}
          selectedCount={selectedResidents.length}
        />
      )}
    </div>
  )
}

function CreateNewResidentGroup({ onBack, onFilterOpen, onCreate, totalKWSelected, totalKWCapacity }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-medium text-teal-500">Create New Resident Group</h2>
        <button className="p-1 text-gray-500 hover:text-gray-700" onClick={onBack}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 pb-4 grid grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2 px-2 py-1 bg-[#626060] text-white rounded-t">
            Resident Group ID
          </h3>
          <input 
            type="text" 
            placeholder="Auto-generated" 
            className="w-full p-2 border border-gray-300 rounded-b text-sm"
            readOnly
          />
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2 px-2 py-1 bg-[#626060] text-white rounded-t">
            DCarbon Group ID
          </h3>
          <input 
            type="text" 
            placeholder="Enter DCarbon ID" 
            className="w-full p-2 border border-gray-300 rounded-b text-sm"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2 px-2 py-1 bg-[#626060] text-white rounded-t">
            Assign WREGIS Group ID
          </h3>
          <input 
            type="text" 
            placeholder="Enter WREGIS ID" 
            className="w-full p-2 border border-gray-300 rounded-b text-sm"
          />
        </div>
      </div>

      <div className="px-4 pb-4 flex justify-end">
        <button 
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50"
          onClick={onFilterOpen}
        >
          <span>Filter by</span>
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Residents Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y text-xs">
              <th className="py-2 px-3 text-left font-medium">Name</th>
              <th className="py-2 px-3 text-left font-medium">Resident ID</th>
              <th className="py-2 px-3 text-left font-medium">Finance Comp.</th>
              <th className="py-2 px-3 text-left font-medium">Installer</th>
              <th className="py-2 px-3 text-left font-medium">Utility Prov.</th>
              <th className="py-2 px-3 text-left font-medium">Address</th>
              <th className="py-2 px-3 text-left font-medium">KW Sys. size</th>
              <th className="py-2 px-3 text-left font-medium">Date of Reg.</th>
            </tr>
          </thead>
          <tbody>
            {Array(5).fill(null).map((_, index) => (
              <tr key={index} className="border-b text-xs hover:bg-gray-50">
                <td className="py-2 px-3">Resident {index + 1}</td>
                <td className="py-2 px-3">RES-{1000 + index}</td>
                <td className="py-2 px-3">Finance Co. {index + 1}</td>
                <td className="py-2 px-3">Installer {index + 1}</td>
                <td className="py-2 px-3">Utility {index + 1}</td>
                <td className="py-2 px-3">{100 + index} Main St</td>
                <td className="py-2 px-3">{5 + index}</td>
                <td className="py-2 px-3">01-0{index + 1}-2023</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="p-1 text-gray-300" disabled>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">1 of 1</span>
          <button className="p-1 text-gray-300" disabled>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="text-sm">
          Total KW selected: {totalKWSelected}kw/{totalKWCapacity}kw
        </div>
      </div>

      <div className="p-4">
        <button 
          className="px-4 py-2 bg-[#039994] text-white rounded hover:bg-[#028984]"
          onClick={onCreate}
        >
          Create Group
        </button>
      </div>
    </div>
  )
}

function ResidentGroupDetails({ group, onBack, onRemoveUsers, onFilterOpen, selectedResidents, onSelectResident }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-[#039994]">Resident Group Details</h2>
        <button 
          className="px-3 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 disabled:opacity-50"
          onClick={onRemoveUsers}
          disabled={selectedResidents.length === 0}
        >
          Remove Users
        </button>
      </div>

      {/* Info Card */}
      <div className="border border-[#039994] rounded-lg p-4 bg-[#069B960D]">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Resident Group Name</p>
            <p className="text-sm font-medium">Total Capacity</p>
            <p className="text-sm font-medium">WREGIS Group ID</p>
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm font-medium">Utility Provider</p>
            <p className="text-sm font-medium">Finance Company</p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-sm">{group.name}</p>
            <p className="text-sm">{group.totalCapacity} kW</p>
            <p className="text-sm">{group.wregisGroupId || 'N/A'}</p>
            <p className="text-sm">{group.status}</p>
            <p className="text-sm">{group.utilityProvider}</p>
            <p className="text-sm">{group.financeCompany || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Facilities</h3>
        <button 
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50"
          onClick={onFilterOpen}
        >
          <span>Filter by</span>
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Facilities Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y text-xs">
              <th className="py-2 px-3 text-left font-medium"></th>
              <th className="py-2 px-3 text-left font-medium">Facility Name</th>
              <th className="py-2 px-3 text-left font-medium">User ID</th>
              <th className="py-2 px-3 text-left font-medium">Finance Comp.</th>
              <th className="py-2 px-3 text-left font-medium">Installer</th>
              <th className="py-2 px-3 text-left font-medium">Utility Prov.</th>
              <th className="py-2 px-3 text-left font-medium">Address</th>
              <th className="py-2 px-3 text-left font-medium">System Cap.</th>
              <th className="py-2 px-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {group.facilities?.map((facility) => (
              <tr key={facility.id} className="border-b text-xs hover:bg-gray-50">
                <td className="py-2 px-3">
                  <input 
                    type="checkbox" 
                    checked={selectedResidents.includes(facility.id)}
                    onChange={() => onSelectResident(facility.id)}
                    className="h-3 w-3 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                </td>
                <td className="py-2 px-3">{facility.facilityName}</td>
                <td className="py-2 px-3">{facility.userId?.substring(0, 8)}...</td>
                <td className="py-2 px-3">{facility.financeCompany}</td>
                <td className="py-2 px-3">{facility.installer}</td>
                <td className="py-2 px-3">{facility.utilityProvider}</td>
                <td className="py-2 px-3">{facility.address}</td>
                <td className="py-2 px-3">{facility.systemCapacity} kW</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    facility.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {facility.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="p-1 text-gray-300" disabled>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">1 of 1</span>
          <button className="p-1 text-gray-300" disabled>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button 
          className="px-3 py-2 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50" 
          onClick={onBack}
        >
          Back to List
        </button>
      </div>
    </div>
  )
}

// Filter Modals
function ResidentGroupsFilterByModal({ onClose, onApplyFilter }) {
  const [filters, setFilters] = useState({
    name: "",
    wregisId: "",
    utilityProvider: "",
    financeCompany: "",
    status: ""
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApply = () => {
    onApplyFilter(filters)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filter Residential Groups</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Group Name</label>
            <input 
              type="text"
              name="name" 
              value={filters.name} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">WREGIS ID</label>
            <input 
              type="text"
              name="wregisId" 
              value={filters.wregisId} 
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
            <label className="block text-sm font-medium">Status</label>
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">All Status</option>
              <option value="FORMATION">Formation</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
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
  )
}

function CreateNewResidentGroupFilterByModal({ onClose, onApplyFilter }) {
  const [filters, setFilters] = useState({
    name: "",
    installer: "",
    utilityProvider: "",
    financeCompany: "",
    address: "",
    minCapacity: "",
    maxCapacity: ""
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApply = () => {
    onApplyFilter(filters)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filter Available Residents</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <input 
              type="text"
              name="name" 
              value={filters.name} 
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
            <label className="block text-sm font-medium">System Capacity Range (kW)</label>
            <div className="flex gap-2">
              <input 
                type="number"
                placeholder="Min" 
                name="minCapacity" 
                value={filters.minCapacity} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input 
                type="number"
                placeholder="Max" 
                name="maxCapacity" 
                value={filters.maxCapacity} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
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
  )
}