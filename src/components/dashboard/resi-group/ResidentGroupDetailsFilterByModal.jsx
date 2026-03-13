"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as styles from "./styles"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className={styles.modalTitle}>Filter Facilities</h3>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <label className={styles.labelClass}>Facility Name</label>
            <input
              type="text"
              name="facilityName"
              value={filters.facilityName}
              onChange={handleInputChange}
              className={styles.inputClass}
            />
          </div>
          <div>
            <label className={styles.labelClass}>Installer</label>
            <input
              type="text"
              name="installer"
              value={filters.installer}
              onChange={handleInputChange}
              className={styles.inputClass}
            />
          </div>
          <div>
            <label className={styles.labelClass}>Utility Provider</label>
            <input
              type="text"
              name="utilityProvider"
              value={filters.utilityProvider}
              onChange={handleInputChange}
              className={styles.inputClass}
            />
          </div>
          <div>
            <label className={styles.labelClass}>Finance Company</label>
            <input
              type="text"
              name="financeCompany"
              value={filters.financeCompany}
              onChange={handleInputChange}
              className={styles.inputClass}
            />
          </div>
          <div>
            <label className={styles.labelClass}>Address</label>
            <input
              type="text"
              name="address"
              value={filters.address}
              onChange={handleInputChange}
              className={styles.inputClass}
            />
          </div>
          <div>
            <label className={styles.labelClass}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className={styles.selectClass}
            >
              <option value="">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleReset} className="font-sfpro">
            Reset Filters
          </Button>
          <Button variant="outline" onClick={onClose} className="font-sfpro">
            Cancel
          </Button>
          <Button onClick={handleApply} className="bg-[#039994] hover:bg-[#02857f] text-white font-sfpro">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
