"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import * as styles from "../../styles";

export default function FilterByModal({ isOpen, onClose, onApply, currentFilters, utilityProviders }) {
  const [filters, setFilters] = useState({
    customerType: "",
    status: "",
    utilityProvider: "",
    documentStatus: "",
    name: "",
    email: ""
  });

  useEffect(() => {
    if (currentFilters) setFilters(currentFilters);
  }, [currentFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      customerType: "",
      status: "",
      utilityProvider: "",
      documentStatus: "",
      name: "",
      email: ""
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className={styles.modalTitle}>Filter Customers</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={styles.labelClass}>Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="Search by name"
            />
          </div>

          <div>
            <label className={styles.labelClass}>Email</label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="Search by email"
            />
          </div>

          <div>
            <label className={styles.labelClass}>Customer Type</label>
            <select
              name="customerType"
              value={filters.customerType}
              onChange={handleChange}
              className={styles.selectClass}
            >
              <option value="">All Types</option>
              <option value="RESIDENTIAL">RESIDENTIAL</option>
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="PARTNER">PARTNER</option>
            </select>
          </div>

          <div>
            <label className={styles.labelClass}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className={styles.selectClass}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
              <option value="Registered">Registered</option>
              <option value="Terminated">Terminated</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className={styles.labelClass}>Utility Provider</label>
            <select
              name="utilityProvider"
              value={filters.utilityProvider}
              onChange={handleChange}
              className={styles.selectClass}
            >
              <option value="">All Providers</option>
              {utilityProviders.map((provider) => (
                <option key={provider.id} value={provider.name}>
                  {provider.name}
                </option>
              ))}
              <option value="Not specified">Not specified</option>
            </select>
          </div>

          <div>
            <label className={styles.labelClass}>Document Status</label>
            <select
              name="documentStatus"
              value={filters.documentStatus}
              onChange={handleChange}
              className={styles.selectClass}
            >
              <option value="">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="issue">Has Issues</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={resetFilters} className="font-sfpro">
              Clear
            </Button>
            <Button variant="outline" onClick={onClose} className="font-sfpro">
              Cancel
            </Button>
            <Button className="bg-[#039994] hover:bg-[#02857f] font-sfpro" type="submit">
              Apply
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}