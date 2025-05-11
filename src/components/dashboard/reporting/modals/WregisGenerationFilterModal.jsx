"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function WregisGenerationFilterModal({ onClose, onApplyFilter }) {
  const [filters, setFilters] = useState({
    generatorId: "",
    reportingUnitId: "",
    vintage: "",
    startDate: "",
    endDate: "",
    totalMWh: ""
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
          <DialogTitle>Filter WREGIS Generation Report</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="generatorId" className="text-right">
              Generator ID
            </Label>
            <Input
              id="generatorId"
              name="generatorId"
              value={filters.generatorId}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reportingUnitId" className="text-right">
              Reporting Unit ID
            </Label>
            <Input
              id="reportingUnitId"
              name="reportingUnitId"
              value={filters.reportingUnitId}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vintage" className="text-right">
              Vintage
            </Label>
            <Input
              id="vintage"
              name="vintage"
              value={filters.vintage}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalMWh" className="text-right">
              Total MWh
            </Label>
            <Input
              id="totalMWh"
              name="totalMWh"
              value={filters.totalMWh}
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