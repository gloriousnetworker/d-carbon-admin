"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResidentGroupsFilterByModal({ onClose, onApplyFilter }) {
  const [filters, setFilters] = useState({
    groupId: "",
    wregisId: "",
    dCarbonId: "",
    financeComp: "",
    installer: "",
    utilityProv: "",
    minREC: "",
    maxREC: "",
    minKW: "",
    maxKW: ""
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApply = () => {
    onApplyFilter(filters)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filter Residential Groups</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupId">Resident Group ID</Label>
            <Input id="groupId" name="groupId" value={filters.groupId} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wregisId">WREGIS ID</Label>
            <Input id="wregisId" name="wregisId" value={filters.wregisId} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dCarbonId">DCarbon ID</Label>
            <Input id="dCarbonId" name="dCarbonId" value={filters.dCarbonId} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="financeComp">Finance Company</Label>
            <Input id="financeComp" name="financeComp" value={filters.financeComp} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installer">Installer</Label>
            <Input id="installer" name="installer" value={filters.installer} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="utilityProv">Utility Provider</Label>
            <Input id="utilityProv" name="utilityProv" value={filters.utilityProv} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label>REC Production Range</Label>
            <div className="flex gap-2">
              <Input placeholder="Min" name="minREC" value={filters.minREC} onChange={handleInputChange} />
              <Input placeholder="Max" name="maxREC" value={filters.maxREC} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>kW Capacity Range</Label>
            <div className="flex gap-2">
              <Input placeholder="Min" name="minKW" value={filters.minKW} onChange={handleInputChange} />
              <Input placeholder="Max" name="maxKW" value={filters.maxKW} onChange={handleInputChange} />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}