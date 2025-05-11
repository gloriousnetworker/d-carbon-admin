"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PartnerPerformanceFilterModal({ onClose, onApplyFilter }) {
  const [filters, setFilters] = useState({
    name: "",
    address: "",
    activeCommGenerators: "",
    activeResidentGenerators: "",
    totalRecsSold: "",
    totalEarnings: ""
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Partner Performance</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={filters.name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              name="address"
              value={filters.address}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activeCommGenerators" className="text-right">
              Active Comm. Generators
            </Label>
            <Input
              id="activeCommGenerators"
              name="activeCommGenerators"
              value={filters.activeCommGenerators}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activeResidentGenerators" className="text-right">
              Active Resident Generators
            </Label>
            <Input
              id="activeResidentGenerators"
              name="activeResidentGenerators"
              value={filters.activeResidentGenerators}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalRecsSold" className="text-right">
              Total RECs Sold
            </Label>
            <Input
              id="totalRecsSold"
              name="totalRecsSold"
              value={filters.totalRecsSold}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalEarnings" className="text-right">
              Total Earnings
            </Label>
            <Input
              id="totalEarnings"
              name="totalEarnings"
              value={filters.totalEarnings}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}