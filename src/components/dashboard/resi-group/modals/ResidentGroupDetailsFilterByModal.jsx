"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResidentGroupDetailsFilterByModal({ onClose, onApplyFilter }) {
  const [filters, setFilters] = useState({
    name: "",
    residentId: "",
    financeComp: "",
    installer: "",
    utilityProv: "",
    address: "",
    minKW: "",
    maxKW: "",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filter Group Residents</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={filters.name} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="residentId">Resident ID</Label>
            <Input id="residentId" name="residentId" value={filters.residentId} onChange={handleInputChange} />
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
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={filters.address} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label>kW System Size Range</Label>
            <div className="flex gap-2">
              <Input placeholder="Min" name="minKW" value={filters.minKW} onChange={handleInputChange} />
              <Input placeholder="Max" name="maxKW" value={filters.maxKW} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Registration Date Range</Label>
            <div className="flex gap-2">
              <Input type="date" placeholder="From" name="dateFrom" value={filters.dateFrom} onChange={handleInputChange} />
              <Input type="date" placeholder="To" name="dateTo" value={filters.dateTo} onChange={handleInputChange} />
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