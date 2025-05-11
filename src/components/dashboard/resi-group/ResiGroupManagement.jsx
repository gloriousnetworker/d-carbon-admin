"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ResidentGroupsFilterByModal from "./modals/ResidentGroupsFilterByModal"
import CreateNewResidentGroupFilterByModal from "./modals/CreateNewResidentGroupFilterByModal"
import ResidentGroupDetailsFilterByModal from "./modals/ResidentGroupDetailsFilterByModal"
import RemoveUsersModal from "./modals/RemoveUsersModal"

// Sample data
const residentialGroups = Array(10).fill(null).map((_, i) => ({
  id: `RG-${1000 + i}`,
  resiGroupId: `RG-${1000 + i}`,
  wregisId: `WREGIS-${2000 + i}`,
  dCarbonId: `DCARBON-${3000 + i}`,
  financeComp: `Finance Co. ${i + 1}`,
  installer: `Installer ${i + 1}`,
  utilityProv: `Utility ${i + 1}`,
  totalRECProd: (200 + i * 10).toString(),
  totalKW: (250 + i * 5).toString(),
  residents: Array(3).fill(null).map((_, j) => ({
    id: `RES-${i}-${j}`,
    name: `Resident ${i}-${j}`,
    residentId: `RES-${i}-${j}`,
    financeComp: `Finance Co. ${i + 1}`,
    installer: `Installer ${i + 1}`,
    utilityProv: `Utility ${i + 1}`,
    address: `${100 + j} Main St, City ${i}`,
    kwSysSize: (5 + j).toString(),
    dateOfReg: `0${j+1}-0${i+1}-2023`
  }))
}))

export default function ResiGroupManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const [createMode, setCreateMode] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedResidents, setSelectedResidents] = useState([])
  const [isMainFilterOpen, setIsMainFilterOpen] = useState(false)
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false)
  const [isDetailsFilterOpen, setIsDetailsFilterOpen] = useState(false)
  const [isRemoveUsersOpen, setIsRemoveUsersOpen] = useState(false)
  
  const totalPages = 4
  const totalKWSelected = 60
  const totalKWCapacity = 250

  const handleCreateGroup = () => {
    // In a real app, this would create the group and update state
    setCreateMode(false)
    // Reset other states
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

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {!createMode && !selectedGroup ? (
        <>
          <div className="flex justify-between mb-6">
            <div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[80px] bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setIsMainFilterOpen(true)}
              >
                <span>Filter by</span>
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                className="gap-2 bg-teal-500 hover:bg-teal-600"
                onClick={() => setCreateMode(true)}
              >
                <Upload className="h-4 w-4" />
                Create Resident Group
              </Button>
            </div>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-0">
              <div className="p-4">
                <h2 className="text-xl font-medium text-teal-500">Residential Groups</h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-y text-sm">
                      <th className="py-3 px-4 text-left font-medium">Resi. Group ID</th>
                      <th className="py-3 px-4 text-left font-medium">WREGIS ID</th>
                      <th className="py-3 px-4 text-left font-medium">DCarbon ID</th>
                      <th className="py-3 px-4 text-left font-medium">Finance Comp.</th>
                      <th className="py-3 px-4 text-left font-medium">Installer</th>
                      <th className="py-3 px-4 text-left font-medium">Utility Prov.</th>
                      <th className="py-3 px-4 text-left font-medium">Total REC Prod.</th>
                      <th className="py-3 px-4 text-left font-medium">Total kW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residentialGroups.map((group, index) => (
                      <tr 
                        key={index} 
                        className="border-b text-sm hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(group)}
                      >
                        <td className="py-3 px-4 text-teal-500">{group.resiGroupId}</td>
                        <td className="py-3 px-4">{group.wregisId}</td>
                        <td className="py-3 px-4">{group.dCarbonId}</td>
                        <td className="py-3 px-4">{group.financeComp}</td>
                        <td className="py-3 px-4">{group.installer}</td>
                        <td className="py-3 px-4">{group.utilityProv}</td>
                        <td className="py-3 px-4">{group.totalRECProd}</td>
                        <td className="py-3 px-4">{group.totalKW}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter Modal */}
          {isMainFilterOpen && (
            <ResidentGroupsFilterByModal 
              onClose={() => setIsMainFilterOpen(false)}
              onApplyFilter={(filters) => {
                // Apply filters logic
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
            // Apply filters logic
            setIsCreateFilterOpen(false)
          }}
        />
      )}

      {/* Details Filter Modal */}
      {isDetailsFilterOpen && (
        <ResidentGroupDetailsFilterByModal
          onClose={() => setIsDetailsFilterOpen(false)}
          onApplyFilter={(filters) => {
            // Apply filters logic
            setIsDetailsFilterOpen(false)
          }}
        />
      )}

      {/* Remove Users Modal */}
      {isRemoveUsersOpen && (
        <RemoveUsersModal
          onClose={() => setIsRemoveUsersOpen(false)}
          onConfirm={(usersToRemove) => {
            // Remove users logic
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
    <Card className="border-gray-200">
      <CardContent className="p-0">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-medium text-teal-500">Create New Resident Group</h2>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-4 pb-4 grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2 px-2 py-1 bg-[#626060] text-white rounded-t">
              Resident Group ID
            </h3>
            <input 
              type="text" 
              placeholder="Auto-generated" 
              className="w-full p-2 border border-gray-300 rounded-b"
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
              className="w-full p-2 border border-gray-300 rounded-b"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2 px-2 py-1 bg-[#626060] text-white rounded-t">
              Assign WREGIS Group ID
            </h3>
            <input 
              type="text" 
              placeholder="Enter WREGIS ID" 
              className="w-full p-2 border border-gray-300 rounded-b"
            />
          </div>
        </div>

        <div className="px-4 pb-4 flex justify-end">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={onFilterOpen}
          >
            <span>Filter by</span>
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Residents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y text-sm">
                <th className="py-3 px-4 text-left font-medium">Name</th>
                <th className="py-3 px-4 text-left font-medium">Resident ID</th>
                <th className="py-3 px-4 text-left font-medium">Finance Comp.</th>
                <th className="py-3 px-4 text-left font-medium">Installer</th>
                <th className="py-3 px-4 text-left font-medium">Utility Prov.</th>
                <th className="py-3 px-4 text-left font-medium">Address</th>
                <th className="py-3 px-4 text-left font-medium">KW Sys. size</th>
                <th className="py-3 px-4 text-left font-medium">Date of Reg.</th>
              </tr>
            </thead>
            <tbody>
              {Array(5).fill(null).map((_, index) => (
                <tr key={index} className="border-b text-sm hover:bg-gray-50">
                  <td className="py-3 px-4">Resident {index + 1}</td>
                  <td className="py-3 px-4">RES-{1000 + index}</td>
                  <td className="py-3 px-4">Finance Co. {index + 1}</td>
                  <td className="py-3 px-4">Installer {index + 1}</td>
                  <td className="py-3 px-4">Utility {index + 1}</td>
                  <td className="py-3 px-4">{100 + index} Main St</td>
                  <td className="py-3 px-4">{5 + index}</td>
                  <td className="py-3 px-4">01-0{index + 1}-2023</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={true}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">1 of 1</span>
            <Button
              variant="ghost"
              size="icon"
              disabled={true}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm">
            Total KW selected: {totalKWSelected}kw/{totalKWCapacity}kw
          </div>
        </div>

        <div className="p-4">
          <Button 
            className="bg-[#039994] hover:bg-[#028984]"
            onClick={onCreate}
          >
            Create Group
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ResidentGroupDetails({ group, onBack, onRemoveUsers, onFilterOpen, selectedResidents, onSelectResident }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-[#039994]">Resident Group Details</h2>
        <Button 
          variant="outline" 
          className="text-red-500 border-red-500 hover:bg-red-50"
          onClick={onRemoveUsers}
          disabled={selectedResidents.length === 0}
        >
          Remove Users
        </Button>
      </div>

      {/* Info Card */}
      <div className="border border-[#039994] rounded-lg p-4 bg-[#069B960D]">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Resident Group ID</p>
            <p className="text-sm font-medium">DCarbon Group ID</p>
            <p className="text-sm font-medium">WREGIS Group ID</p>
            <p className="text-sm font-medium">Total REC Production</p>
            <p className="text-sm font-medium">Total kW</p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-sm">{group.resiGroupId}</p>
            <p className="text-sm">{group.dCarbonId}</p>
            <p className="text-sm">{group.wregisId}</p>
            <p className="text-sm">{group.totalRECProd}</p>
            <p className="text-sm">{group.totalKW}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Residents</h3>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onFilterOpen}
        >
          <span>Filter by</span>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Residents Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y text-sm">
              <th className="py-3 px-4 text-left font-medium"></th>
              <th className="py-3 px-4 text-left font-medium">Name</th>
              <th className="py-3 px-4 text-left font-medium">Resident ID</th>
              <th className="py-3 px-4 text-left font-medium">Finance Comp.</th>
              <th className="py-3 px-4 text-left font-medium">Installer</th>
              <th className="py-3 px-4 text-left font-medium">Utility Prov.</th>
              <th className="py-3 px-4 text-left font-medium">Address</th>
              <th className="py-3 px-4 text-left font-medium">KW Sys. size</th>
              <th className="py-3 px-4 text-left font-medium">Date of Reg.</th>
            </tr>
          </thead>
          <tbody>
            {group.residents.map((resident) => (
              <tr key={resident.id} className="border-b text-sm hover:bg-gray-50">
                <td className="py-3 px-4">
                  <input 
                    type="checkbox" 
                    checked={selectedResidents.includes(resident.id)}
                    onChange={() => onSelectResident(resident.id)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                </td>
                <td className="py-3 px-4">{resident.name}</td>
                <td className="py-3 px-4">{resident.residentId}</td>
                <td className="py-3 px-4">{resident.financeComp}</td>
                <td className="py-3 px-4">{resident.installer}</td>
                <td className="py-3 px-4">{resident.utilityProv}</td>
                <td className="py-3 px-4">{resident.address}</td>
                <td className="py-3 px-4">{resident.kwSysSize}</td>
                <td className="py-3 px-4">{resident.dateOfReg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            disabled={true}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">1 of 1</span>
          <Button
            variant="ghost"
            size="icon"
            disabled={true}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to List
        </Button>
      </div>
    </div>
  )
}