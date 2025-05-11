"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CommercialRecGenerationFilterModal({ onClose, onApplyFilter, view }) {
  const [filters, setFilters] = useState({
    name: "",
    commercialId: "",
    ...(view === "payout" ? { invoiceId: "" } : { recBalance: "" }),
    dateFrom: "",
    dateTo: ""
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
          <DialogTitle>Filter {view === "sales" ? "Commercial REC Sales" : "Commercial REC Payout"}</DialogTitle>
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
            <Label htmlFor="commercialId" className="text-right">
              Commercial ID
            </Label>
            <Input
              id="commercialId"
              name="commercialId"
              value={filters.commercialId}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          {view === "sales" ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recBalance" className="text-right">
                REC Balance
              </Label>
              <Input
                id="recBalance"
                name="recBalance"
                value={filters.recBalance}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoiceId" className="text-right">
                Invoice ID
              </Label>
              <Input
                id="invoiceId"
                name="invoiceId"
                value={filters.invoiceId}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateFrom" className="text-right">
              Date From
            </Label>
            <Input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateTo" className="text-right">
              Date To
            </Label>
            <Input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
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