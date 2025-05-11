"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as styles from "../styles"

export default function CommercialStatementPayoutFilterModal({ onClose, onApplyFilter }) {
  const [filters, setFilters] = useState({
    name: "",
    commercialId: "",
    invoiceId: "",
    dateFrom: "",
    dateTo: "",
    status: "All"
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onApplyFilter(filters)
  }

  const handleReset = () => {
    setFilters({
      name: "",
      commercialId: "",
      invoiceId: "",
      dateFrom: "",
      dateTo: "",
      status: "All"
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium text-lg text-teal-500">Filter Commercial Payouts</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className={styles.labelClass}>Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={filters.name}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="Filter by name"
            />
          </div>

          <div>
            <label htmlFor="commercialId" className={styles.labelClass}>Commercial ID</label>
            <input
              type="text"
              id="commercialId"
              name="commercialId"
              value={filters.commercialId}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="Filter by commercial ID"
            />
          </div>

          <div>
            <label htmlFor="invoiceId" className={styles.labelClass}>Invoice ID</label>
            <input
              type="text"
              id="invoiceId"
              name="invoiceId"
              value={filters.invoiceId}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="Filter by invoice ID"
            />
          </div>

          <div className={styles.rowWrapper}>
            <div className={styles.halfWidth}>
              <label htmlFor="dateFrom" className={styles.labelClass}>Date From</label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleChange}
                className={styles.inputClass}
              />
            </div>

            <div className={styles.halfWidth}>
              <label htmlFor="dateTo" className={styles.labelClass}>Date To</label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleChange}
                className={styles.inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className={styles.labelClass}>Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleChange}
              className={styles.selectClass}
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="pt-4 flex space-x-4">
            <Button 
              type="button" 
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}