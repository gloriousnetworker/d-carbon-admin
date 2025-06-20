"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, X, Edit, Check, Trash2 } from "lucide-react"
import ResidentGroupDetailsFilterByModal from "./ResidentGroupDetailsFilterByModal"
import toast from "react-hot-toast"
import * as styles from "./styles"

export default function ResidentGroupDetails({ 
  group: initialGroup,
  onBack, 
  selectedResidents, 
  onSelectResident 
}) {
  const [group, setGroup] = useState(initialGroup)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({})
  const [isEditingWregis, setIsEditingWregis] = useState(false)
  const [wregisInput, setWregisInput] = useState(initialGroup.wregisGroupId || '')

  // Fetch detailed group information when component mounts
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true)
        const authToken = localStorage.getItem('authToken')
        
        const response = await fetch(
          `https://services.dcarbon.solutions/api/residential-facility/groups/${initialGroup.id}`, 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch group details')
        }
        
        const data = await response.json()
        setGroup(data.data)
        setWregisInput(data.data.wregisGroupId || '')
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching group details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupDetails()
  }, [initialGroup.id])

  // Handle removing facilities from group
  const handleRemoveFacilities = async () => {
    if (selectedResidents.length === 0) {
      toast.error("Please select at least one facility to remove")
      return
    }

    try {
      setLoading(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/residential-facility/groups/${group.id}/remove-facilities`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            facilityIds: selectedResidents
          })
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to remove facilities from group')
      }
      
      const data = await response.json()
      setGroup(prev => ({
        ...prev,
        facilities: prev.facilities?.filter(f => !selectedResidents.includes(f.id))
      }))
      toast.success("Facilities removed successfully!")
      onSelectResident([])
    } catch (err) {
      setError(err.message)
      toast.error(`Error: ${err.message}`)
      console.error('Error removing facilities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle updating WREGIS ID
  const handleUpdateWregis = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/admin/ddg/${group.id}/wregis`, 
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            wregisGroupId: wregisInput
          })
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to update WREGIS ID')
      }
      
      const data = await response.json()
      setGroup(prev => ({
        ...prev,
        wregisGroupId: data.data.wregisGroupId
      }))
      setIsEditingWregis(false)
      toast.success("WREGIS ID updated successfully!")
    } catch (err) {
      setError(err.message)
      toast.error(`Error: ${err.message}`)
      console.error('Error updating WREGIS ID:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter facilities based on applied filters
  const filteredFacilities = group.facilities?.filter(facility => {
    if (!filters || Object.keys(filters).length === 0) return true
    
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      
      switch (key) {
        case 'facilityName':
          return facility.facilityName?.toLowerCase().includes(value.toLowerCase())
        case 'installer':
          return facility.installer?.toLowerCase().includes(value.toLowerCase())
        case 'utilityProvider':
          return facility.utilityProvider?.toLowerCase().includes(value.toLowerCase())
        case 'financeCompany':
          return facility.financeCompany?.toLowerCase().includes(value.toLowerCase())
        case 'address':
          return facility.address?.toLowerCase().includes(value.toLowerCase())
        case 'status':
          return facility.status?.toLowerCase().includes(value.toLowerCase())
        default:
          return true
      }
    })
  }) || []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {loading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center text-teal-600 hover:text-teal-800">
            <ChevronLeft size={20} />
            <span className="text-lg font-medium text-teal-600">Resident Group Details</span>
          </button>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleRemoveFacilities}
          disabled={selectedResidents.length === 0}
        >
          <Trash2 size={16} />
          Remove Users
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Info Card */}
      <div className="w-full border border-[#039994] rounded-lg p-6 bg-[#069B960D] mb-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-3">
            <div>
              <p className={styles.labelClass}>Resident Group ID</p>
              <p className="text-sm text-gray-900">{group.id}</p>
            </div>
            <div>
              <p className={styles.labelClass}>WREGIS Group ID</p>
              <div className="flex items-center gap-2">
                {isEditingWregis ? (
                  <input
                    type="text"
                    value={wregisInput}
                    onChange={(e) => setWregisInput(e.target.value)}
                    className="flex-1 p-1 border border-gray-300 rounded text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{group.wregisGroupId || 'N/A'}</p>
                )}
                {isEditingWregis ? (
                  <button 
                    onClick={handleUpdateWregis}
                    className="p-1 text-green-500 hover:text-green-700"
                  >
                    <Check size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditingWregis(true)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <Edit size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className={styles.labelClass}>DCarbon Group ID</p>
              <p className="text-sm text-gray-900">{group.id}</p>
            </div>
            <div>
              <p className={styles.labelClass}>Total REC Production</p>
              <p className="text-sm text-gray-900">{group.totalCapacity}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className={styles.labelClass}>WREGIS Group ID</p>
              <p className="text-sm text-gray-900">{group.wregisGroupId || 'N/A'}</p>
            </div>
            <div>
              <p className={styles.labelClass}>Total kW</p>
              <p className="text-sm text-gray-900">{group.totalCapacity} kW</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className={styles.labelClass}>Group ID</p>
              <p className="text-sm text-gray-900">{group.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Residents Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Residents</h3>
          <button 
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded bg-white text-sm hover:bg-gray-50"
            onClick={() => setIsFilterOpen(true)}
          >
            <span>Filter by</span>
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resident ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finance Comp.</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installer</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utility Prov.</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">kW system size</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Reg.</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFacilities.map((facility) => (
                <tr key={facility.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input 
                      type="checkbox" 
                      checked={selectedResidents.includes(facility.id)}
                      onChange={() => onSelectResident(facility.id)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{facility.facilityName}</td>
                  <td className="py-3 px-4 text-sm text-blue-600">{facility.id?.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{facility.financeCompany}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{facility.installer}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{facility.utilityProvider}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{facility.address}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{facility.systemCapacity} kW</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{facility.dateOfRegistration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-400" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">Previous</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-500 text-white rounded text-sm">1</span>
            <span className="text-sm text-gray-600">of</span>
            <span className="text-sm text-gray-600">4</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Next</span>
            <button className="p-1 text-gray-600 hover:text-gray-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <ResidentGroupDetailsFilterByModal 
          onClose={() => setIsFilterOpen(false)}
          onApplyFilter={(newFilters) => {
            setFilters(newFilters)
            setIsFilterOpen(false)
          }}
        />
      )}
    </div>
  )
}