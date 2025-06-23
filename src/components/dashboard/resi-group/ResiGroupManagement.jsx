"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, Upload, X, Trash2 } from "lucide-react"
import * as styles from "./styles"
import ResiGroupManagementDetails from "./ResiGroupManagementDetails"
import ResidentGroupDetailsFilterByModal from "./ResidentGroupDetailsFilterByModal"

export default function ResiGroupManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const [createMode, setCreateMode] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedResidents, setSelectedResidents] = useState([])
  const [isMainFilterOpen, setIsMainFilterOpen] = useState(false)
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false)
  const [isDetailsFilterOpen, setIsDetailsFilterOpen] = useState(false)
  const [isRemoveUsersOpen, setIsRemoveUsersOpen] = useState(false)
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false)
  const [residentialGroups, setResidentialGroups] = useState([])
  const [availableFacilities, setAvailableFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [facilitiesLoading, setFacilitiesLoading] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [createGroupForm, setCreateGroupForm] = useState({
    name: "",
    dcarbonGroupId: "",
    wregisGroupId: ""
  })
  
  const itemsPerPage = 10
  const totalPages = Math.ceil(residentialGroups.length / itemsPerPage)
  const totalKWCapacity = 250

  const totalKWSelected = selectedResidents.reduce((total, residentId) => {
    const resident = availableFacilities.find(f => f.id === residentId)
    return total + (resident?.systemCapacity || 0)
  }, 0)

  useEffect(() => {
    fetchResidentialGroups()
  }, [])

  useEffect(() => {
    if (createMode) {
      fetchAvailableFacilities()
    }
  }, [createMode])

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

  const fetchAvailableFacilities = async () => {
    try {
      setFacilitiesLoading(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch('https://services.dcarbon.solutions/api/residential-facility/get-all-residential-facility', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch available facilities')
      }
      
      const data = await response.json()
      setAvailableFacilities(data.data.facilities || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching available facilities:', err)
    } finally {
      setFacilitiesLoading(false)
    }
  }

  const fetchGroupDetails = async (groupId) => {
    try {
      setDetailsLoading(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`https://services.dcarbon.solutions/api/residential-facility/groups/${groupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch group details')
      }
      
      const data = await response.json()
      setSelectedGroup(data.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching group details:', err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    try {
      setCreatingGroup(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch('https://services.dcarbon.solutions/api/residential-facility/group-facilities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: createGroupForm.name,
          dcarbonGroupId: createGroupForm.dcarbonGroupId,
          wregisGroupId: createGroupForm.wregisGroupId,
          facilityIds: selectedResidents
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create group')
      }
      
      const data = await response.json()
      await fetchResidentialGroups()
      setCreateMode(false)
      setSelectedResidents([])
      setCreateGroupForm({
        name: "",
        dcarbonGroupId: "",
        wregisGroupId: ""
      })
    } catch (err) {
      setError(err.message)
      console.error('Error creating group:', err)
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleDeleteGroup = async () => {
    try {
      setDetailsLoading(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`https://services.dcarbon.solutions/api/residential-facility/groups/${selectedGroup.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete group')
      }
      
      await fetchResidentialGroups()
      setSelectedGroup(null)
      setIsDeleteGroupOpen(false)
    } catch (err) {
      setError(err.message)
      console.error('Error deleting group:', err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleRowClick = async (group) => {
    await fetchGroupDetails(group.id)
    setCreateMode(false)
  }

  const handleBackToList = () => {
    setSelectedGroup(null)
    setCreateMode(false)
    setSelectedResidents([])
  }

  const toggleResidentSelection = (residentId) => {
    setSelectedResidents(prev => 
      prev.includes(residentId) 
        ? prev.filter(id => id !== residentId) 
        : [...prev, residentId]
    )
  }

  const handleRemoveUsers = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`https://services.dcarbon.solutions/api/residential-facility/groups/${selectedGroup.id}/remove-facilities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facilityIds: selectedResidents
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove users from group')
      }
      
      await fetchGroupDetails(selectedGroup.id)
      setSelectedResidents([])
      setIsRemoveUsersOpen(false)
    } catch (err) {
      setError(err.message)
      console.error('Error removing users:', err)
    }
  }

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

  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const filteredFacilities = availableFacilities.filter(facility => {
    if (!filters || Object.keys(filters).length === 0) return true
    
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      
      switch (key) {
        case 'name':
          return facility.facilityName?.toLowerCase().includes(value.toLowerCase())
        case 'installer':
          return facility.installer?.toLowerCase().includes(value.toLowerCase())
        case 'utilityProvider':
          return facility.utilityProvider?.toLowerCase().includes(value.toLowerCase())
        case 'financeCompany':
          return facility.financeCompany?.toLowerCase().includes(value.toLowerCase())
        case 'address':
          return facility.address?.toLowerCase().includes(value.toLowerCase())
        case 'minCapacity':
          return facility.systemCapacity >= parseFloat(value)
        case 'maxCapacity':
          return facility.systemCapacity <= parseFloat(value)
        default:
          return true
      }
    })
  })

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target
    setCreateGroupForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

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
                    <th className="py-2 px-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGroups.map((group) => (
                    <tr 
                      key={group.id} 
                      className="border-b text-xs hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 text-teal-500 cursor-pointer" onClick={() => handleRowClick(group)}>{group.name}</td>
                      <td className="py-2 px-3 cursor-pointer" onClick={() => handleRowClick(group)}>{group.wregisGroupId || 'N/A'}</td>
                      <td className="py-2 px-3 cursor-pointer" onClick={() => handleRowClick(group)}>
                        <span className={`px-2 py-1 rounded text-xs ${
                          group.status === 'FORMATION' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {group.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 cursor-pointer" onClick={() => handleRowClick(group)}>{group.financeCompany || 'N/A'}</td>
                      <td className="py-2 px-3 cursor-pointer" onClick={() => handleRowClick(group)}>{group.utilityProvider}</td>
                      <td className="py-2 px-3 cursor-pointer" onClick={() => handleRowClick(group)}>{group.totalCapacity} kW</td>
                      <td className="py-2 px-3 cursor-pointer" onClick={() => handleRowClick(group)}>{group.facilities?.length || 0}</td>
                      <td className="py-2 px-3 cursor-pointer" onClick={() => handleRowClick(group)}>{new Date(group.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedGroup(group)
                            setIsDeleteGroupOpen(true)
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex items-center justify-center gap-4">
              <button
                className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm">
                {currentPage} of {totalPages || 1}
              </span>
              <button
                className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isMainFilterOpen && (
            <ResidentGroupsFilterByModal 
              onClose={() => setIsMainFilterOpen(false)}
              onApplyFilter={(newFilters) => {
                setFilters(newFilters)
                setIsMainFilterOpen(false)
                setCurrentPage(1)
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
          facilities={filteredFacilities}
          loading={facilitiesLoading}
          selectedResidents={selectedResidents}
          onSelectResident={toggleResidentSelection}
          formData={createGroupForm}
          onFormChange={handleCreateFormChange}
          creatingGroup={creatingGroup}
          error={error}
        />
      ) : selectedGroup && (
        <ResiGroupManagementDetails 
          group={selectedGroup}
          loading={detailsLoading}
          onBack={handleBackToList}
          onRemoveUsers={() => setIsRemoveUsersOpen(true)}
          onDeleteGroup={() => setIsDeleteGroupOpen(true)}
          onFilterOpen={() => setIsDetailsFilterOpen(true)}
          selectedResidents={selectedResidents}
          onSelectResident={toggleResidentSelection}
        />
      )}

      {isCreateFilterOpen && (
        <CreateNewResidentGroupFilterByModal
          onClose={() => setIsCreateFilterOpen(false)}
          onApplyFilter={(filters) => {
            setFilters(filters)
            setIsCreateFilterOpen(false)
          }}
        />
      )}

      {isDetailsFilterOpen && (
        <ResidentGroupDetailsFilterByModal
          onClose={() => setIsDetailsFilterOpen(false)}
          onApplyFilter={(filters) => {
            setIsDetailsFilterOpen(false)
          }}
        />
      )}

      {isRemoveUsersOpen && (
        <RemoveUsersModal
          onClose={() => setIsRemoveUsersOpen(false)}
          onConfirm={handleRemoveUsers}
          selectedCount={selectedResidents.length}
        />
      )}

      {isDeleteGroupOpen && (
        <DeleteGroupModal
          onClose={() => setIsDeleteGroupOpen(false)}
          onConfirm={handleDeleteGroup}
          groupName={selectedGroup?.name}
        />
      )}
    </div>
  )
}

function CreateNewResidentGroup({ 
  onBack, 
  onFilterOpen, 
  onCreate, 
  totalKWSelected, 
  totalKWCapacity,
  facilities,
  loading,
  selectedResidents,
  onSelectResident,
  formData,
  onFormChange,
  creatingGroup,
  error
}) {
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
            Resident Group Name
          </h3>
          <input 
            type="text" 
            name="name"
            placeholder="Enter group name" 
            className="w-full p-2 border border-gray-300 rounded-b text-sm"
            value={formData.name}
            onChange={onFormChange}
            required
          />
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2 px-2 py-1 bg-[#626060] text-white rounded-t">
            DCarbon Group ID
          </h3>
          <input 
            type="text" 
            name="dcarbonGroupId"
            placeholder="Enter DCarbon ID" 
            className="w-full p-2 border border-gray-300 rounded-b text-sm"
            value={formData.dcarbonGroupId}
            onChange={onFormChange}
          />
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2 px-2 py-1 bg-[#626060] text-white rounded-t">
            Assign WREGIS Group ID
          </h3>
          <input 
            type="text" 
            name="wregisGroupId"
            placeholder="Enter WREGIS ID" 
            className="w-full p-2 border border-gray-300 rounded-b text-sm"
            value={formData.wregisGroupId}
            onChange={onFormChange}
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

      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y text-xs">
              <th className="py-2 px-3 text-left font-medium">Select</th>
              <th className="py-2 px-3 text-left font-medium">Facility Name</th>
              <th className="py-2 px-3 text-left font-medium">Facility ID</th>
              <th className="py-2 px-3 text-left font-medium">Finance Comp.</th>
              <th className="py-2 px-3 text-left font-medium">Installer</th>
              <th className="py-2 px-3 text-left font-medium">Utility Prov.</th>
              <th className="py-2 px-3 text-left font-medium">Address</th>
              <th className="py-2 px-3 text-left font-medium">KW Capacity</th>
              <th className="py-2 px-3 text-left font-medium">Date of Reg.</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="py-4 text-center">
                  Loading facilities...
                </td>
              </tr>
            ) : facilities.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-4 text-center">
                  No facilities found
                </td>
              </tr>
            ) : (
              facilities.map((facility) => (
                <tr key={facility.id} className="border-b text-xs hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <input 
                      type="checkbox" 
                      checked={selectedResidents.includes(facility.id)}
                      onChange={() => onSelectResident(facility.id)}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="py-2 px-3">{facility.facilityName}</td>
                  <td className="py-2 px-3">{facility.id}</td>
                  <td className="py-2 px-3">{facility.financeCompany || 'N/A'}</td>
                  <td className="py-2 px-3">{facility.installer}</td>
                  <td className="py-2 px-3">{facility.utilityProvider}</td>
                  <td className="py-2 px-3">{facility.address}</td>
                  <td className="py-2 px-3">{facility.systemCapacity}</td>
                  <td className="py-2 px-3">
                    {facility.createdAt ? new Date(facility.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
          className={`px-4 py-2 text-white rounded hover:bg-[#028984] ${
            creatingGroup ? 'bg-gray-400' : 'bg-[#039994]'
          }`}
          onClick={onCreate}
          disabled={creatingGroup}
        >
          {creatingGroup ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  )
}

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
            <label className="block text-sm font-medium">Facility Name</label>
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

function RemoveUsersModal({ onClose, onConfirm, selectedCount }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Remove Users</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mb-4">Are you sure you want to remove {selectedCount} user(s) from this group?</p>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Confirm Remove
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteGroupModal({ onClose, onConfirm, groupName }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Delete Group</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mb-4">Are you sure you want to delete the group "{groupName}"? This action cannot be undone.</p>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Group
          </button>
        </div>
      </div>
    </div>
  )
}