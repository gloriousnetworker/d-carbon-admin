"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  X,
  ArrowUpDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function CustomerReport({ onBack }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReportType, setActiveReportType] = useState("Commercial REC Generation");
  const [activeTab, setActiveTab] = useState("Commercial REC Sales");
  
  // State for data
  const [salesData, setSalesData] = useState([]);
  const [payoutsData, setPayoutsData] = useState([]);
  const [wregisData, setWregisData] = useState([]);
  
  // State for filtered/sorted data
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [filteredPayoutsData, setFilteredPayoutsData] = useState([]);
  const [filteredWregisData, setFilteredWregisData] = useState([]);
  
  // State for filter dialog
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Initialize with mock data
  useEffect(() => {
    // Mock data for REC Sales
    const mockSalesData = Array(25).fill().map((_, i) => ({
      name: `Customer ${i + 1}`,
      customerId: `CUS-${1000 + i}`,
      address: `${100 + i} Main Street`,
      zipcode: i % 2 === 0 ? "90010" : "90210",
      avgRecPrice: `$${(15 + Math.random() * 10).toFixed(2)}`,
      recBalance: `${Math.floor(10 + Math.random() * 30)}`,
      recSold: `${Math.floor(5 + Math.random() * 25)}`,
      date: `${(i % 28) + 1}-${(i % 12) + 1}-2025`
    }));

    // Mock data for REC Payouts
    const mockPayoutsData = Array(25).fill().map((_, i) => ({
      name: `Customer ${i + 1}`,
      customerId: `CUS-${1000 + i}`,
      address: `${100 + i} Main Street`,
      zipcode: i % 2 === 0 ? "90010" : "90210",
      avgRecPrice: `$${(15 + Math.random() * 10).toFixed(2)}`,
      recSold: `${Math.floor(5 + Math.random() * 25)}`,
      revenueTier: i % 3 === 0 ? "60%" : i % 3 === 1 ? "75%" : "50%",
      recPayout: `$${(100 + Math.random() * 300).toFixed(2)}`,
      date: `${(i % 28) + 1}-${(i % 12) + 1}-2025`
    }));

    // Mock data for WREGIS Generation Report
    const mockWregisData = Array(25).fill().map((_, i) => ({
      generatorId: `GEN-${2000 + i}`,
      reportingUnitId: `RU-${3000 + i}`,
      vintage: `${(i % 28) + 1}-${(i % 12) + 1}-${2022 + (i % 3)}`,
      startDate: `${(i % 28) + 1}-${(i % 12) + 1}-2025`,
      endDate: `${((i + 15) % 28) + 1}-${((i + 1) % 12) + 1}-2025`,
      totalMwh: (0.05 + Math.random() * 0.1).toFixed(4)
    }));

    setSalesData(mockSalesData);
    setPayoutsData(mockPayoutsData);
    setWregisData(mockWregisData);
    
    setFilteredSalesData(mockSalesData);
    setFilteredPayoutsData(mockPayoutsData);
    setFilteredWregisData(mockWregisData);
  }, []);

  // Get current data based on active report type and tab
  const getCurrentData = () => {
    if (activeReportType === "Commercial REC Generation") {
      if (activeTab === "Commercial REC Sales") {
        return filteredSalesData;
      } else {
        return filteredPayoutsData;
      }
    } else {
      return filteredWregisData;
    }
  };

  // Get column definitions for the current view
  const getColumns = () => {
    if (activeReportType === "Commercial REC Generation") {
      if (activeTab === "Commercial REC Sales") {
        return [
          { key: 'name', label: 'Name' },
          { key: 'customerId', label: 'Customer ID' },
          { key: 'address', label: 'Address' },
          { key: 'zipcode', label: 'Zipcode' },
          { key: 'avgRecPrice', label: 'Avg. REC Price' },
          { key: 'recBalance', label: 'REC Balance' },
          { key: 'recSold', label: 'REC Sold' },
          { key: 'date', label: 'Date' }
        ];
      } else {
        return [
          { key: 'name', label: 'Name' },
          { key: 'customerId', label: 'Customer ID' },
          { key: 'address', label: 'Address' },
          { key: 'zipcode', label: 'Zipcode' },
          { key: 'avgRecPrice', label: 'Avg. REC Price' },
          { key: 'recSold', label: 'REC Sold' },
          { key: 'revenueTier', label: 'Revenue Tier' },
          { key: 'recPayout', label: 'REC Payout' },
          { key: 'date', label: 'Date' }
        ];
      }
    } else {
      return [
        { key: 'generatorId', label: 'Generator ID' },
        { key: 'reportingUnitId', label: 'Reporting Unit ID' },
        { key: 'vintage', label: 'Vintage' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        { key: 'totalMwh', label: 'Total MWh' }
      ];
    }
  };

  // Get original data source based on active report type and tab
  const getOriginalData = () => {
    if (activeReportType === "Commercial REC Generation") {
      if (activeTab === "Commercial REC Sales") {
        return salesData;
      } else {
        return payoutsData;
      }
    } else {
      return wregisData;
    }
  };

  // Update filtered data when filters change
  const updateFilteredData = () => {
    const originalData = getOriginalData();
    const filters = activeFilters;
    
    let result = [...originalData];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      Object.keys(filters).forEach(key => {
        const filterValues = filters[key];
        if (filterValues && filterValues.length > 0) {
          result = result.filter(item => {
            return filterValues.some(val => 
              item[key].toString().toLowerCase().includes(val.toLowerCase())
            );
          });
        }
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Remove currency symbols for numeric comparison
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle currency values
        if (typeof aValue === 'string' && aValue.startsWith('$')) {
          aValue = parseFloat(aValue.substring(1));
          bValue = parseFloat(bValue.substring(1));
        }
        
        // Handle percentage values
        if (typeof aValue === 'string' && aValue.endsWith('%')) {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }
        
        // Handle numeric strings
        if (!isNaN(aValue) && !isNaN(bValue)) {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Update the appropriate filtered data
    if (activeReportType === "Commercial REC Generation") {
      if (activeTab === "Commercial REC Sales") {
        setFilteredSalesData(result);
      } else {
        setFilteredPayoutsData(result);
      }
    } else {
      setFilteredWregisData(result);
    }
  };
  
  // Effect to update filtered data when filters or sort change
  useEffect(() => {
    updateFilteredData();
  }, [activeFilters, sortConfig.key, sortConfig.direction]);

  // Effect to reset pagination when data view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeReportType, activeTab]);

  // Effect to gather filter options when tab or report type changes
  useEffect(() => {
    const columns = getColumns();
    const data = getOriginalData();
    
    const newFilterOptions = {};
    
    columns.forEach(column => {
      // Get unique values for each column
      const uniqueValues = [...new Set(data.map(item => item[column.key]))];
      newFilterOptions[column.key] = uniqueValues;
    });
    
    setFilterOptions(newFilterOptions);
    
    // Reset active filters when view changes
    setActiveFilters({});
  }, [activeReportType, activeTab]);

  const handleReportTypeChange = (type) => {
    setActiveReportType(type);
    // Reset tab when changing report type
    if (type === "Commercial REC Generation") {
      setActiveTab("Commercial REC Sales");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filter dialog
  const openFilterDialog = () => {
    setFilterDialogOpen(true);
  };
  
  const closeFilterDialog = () => {
    setFilterDialogOpen(false);
  };
  
  const applyFilters = (newFilters) => {
    setActiveFilters(newFilters);
    closeFilterDialog();
  };
  
  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // Remove a specific filter value
  const removeFilter = (key, value) => {
    const updatedFilters = { ...activeFilters };
    updatedFilters[key] = updatedFilters[key].filter(v => v !== value);
    
    if (updatedFilters[key].length === 0) {
      delete updatedFilters[key];
    }
    
    setActiveFilters(updatedFilters);
  };

  // Pagination
  const itemsPerPage = 10;
  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const currentItems = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Export to CSV
  const exportToCSV = () => {
    const columns = getColumns();
    const data = getCurrentData();
    
    // Create CSV header
    const header = columns.map(col => col.label).join(',');
    
    // Create CSV rows
    const rows = data.map(item => {
      return columns.map(col => {
        // Wrap values with commas in quotes
        const value = item[col.key];
        if (value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
    });
    
    // Combine header and rows
    const csv = [header, ...rows].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set file name based on current view
    let fileName = '';
    if (activeReportType === "Commercial REC Generation") {
      fileName = activeTab === "Commercial REC Sales" 
        ? 'commercial_rec_sales.csv' 
        : 'commercial_rec_payouts.csv';
    } else {
      fileName = 'wregis_generation_report.csv';
    }
    
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-xl font-medium ml-1">Customer Report</span>
        </button>
      </div>

      {/* Report Type Dropdown */}
      <div className="mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 text-xl font-medium text-teal-500 p-0">
              {activeReportType}
              <ChevronDown className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleReportTypeChange("Commercial REC Generation")}>
              Commercial REC Generation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReportTypeChange("WREGIS Generation Report")}>
              WREGIS Generation Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(activeFilters).map(([key, values]) => (
            values.map(value => (
              <Badge key={`${key}-${value}`} variant="outline" className="flex items-center gap-1 px-2 py-1">
                {key}: {value}
                <button onClick={() => removeFilter(key, value)} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
            Clear All
          </Button>
        </div>
      )}

      {/* Filter and Export Controls */}
      <div className="flex justify-end mb-4 gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border rounded-md px-4 py-2"
          onClick={openFilterDialog}
        >
          <Filter className="h-4 w-4" />
          Filter by
        </Button>

        {activeReportType === "Commercial REC Generation" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 border rounded-md px-4 py-2"
              >
                Sort by 
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {getColumns().map(column => (
                <DropdownMenuItem 
                  key={column.key}
                  onClick={() => requestSort(column.key)}
                  className="flex items-center justify-between"
                >
                  {column.label}
                  {sortConfig.key === column.key && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setSortConfig({ key: null, direction: 'asc' })}
              >
                Clear Sorting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button 
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-md px-4 py-2 flex items-center gap-2"
          onClick={exportToCSV}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 10V12.6667C2 13.0203 2.14048 13.3594 2.39052 13.6095C2.64057 13.8595 2.97971 14 3.33333 14H12.6667C13.0203 14 13.3594 13.8595 13.6095 13.6095C13.8595 13.3594 14 13.0203 14 12.6667V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.3334 5.33333L8.00002 2L4.66669 5.33333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 2V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export Report
        </Button>
      </div>

      {/* Tabs for Commercial REC Generation */}
      {activeReportType === "Commercial REC Generation" && (
        <div className="flex mb-4">
          <Button 
            className={`flex-1 rounded-none border-b-2 py-2 ${activeTab === "Commercial REC Sales" ? "bg-gray-100 text-black border-b-gray-300" : "bg-teal-500 text-white border-b-teal-500"}`}
            onClick={() => handleTabChange("Commercial REC Sales")}
          >
            Commercial REC Sales
          </Button>
          <Button 
            className={`flex-1 rounded-none border-b-2 py-2 ${activeTab === "Commercial REC Payouts" ? "bg-gray-100 text-black border-b-gray-300" : "bg-teal-500 text-white border-b-teal-500"}`}
            onClick={() => handleTabChange("Commercial REC Payouts")}
          >
            Commercial REC Payouts
          </Button>
        </div>
      )}

      {/* Tables */}
      <div className="overflow-x-auto">
        {/* Commercial REC Sales Table */}
        {activeReportType === "Commercial REC Generation" && activeTab === "Commercial REC Sales" && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-t">
                {getColumns().map(column => (
                  <th 
                    key={column.key} 
                    className="text-left py-2 px-4 font-medium cursor-pointer"
                    onClick={() => requestSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {sortConfig.key === column.key && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  {getColumns().map(column => (
                    <td key={column.key} className="py-3 px-4">{item[column.key]}</td>
                  ))}
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={getColumns().length} className="py-6 text-center text-gray-500">
                    No data found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Commercial REC Payouts Table */}
        {activeReportType === "Commercial REC Generation" && activeTab === "Commercial REC Payouts" && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-t">
                {getColumns().map(column => (
                  <th 
                    key={column.key} 
                    className="text-left py-2 px-4 font-medium cursor-pointer"
                    onClick={() => requestSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {sortConfig.key === column.key && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  {getColumns().map(column => (
                    <td key={column.key} className="py-3 px-4">{item[column.key]}</td>
                  ))}
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={getColumns().length} className="py-6 text-center text-gray-500">
                    No data found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* WREGIS Generation Report Table */}
        {activeReportType === "WREGIS Generation Report" && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-t">
                {getColumns().map(column => (
                  <th 
                    key={column.key} 
                    className="text-left py-2 px-4 font-medium cursor-pointer"
                    onClick={() => requestSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {sortConfig.key === column.key && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  {getColumns().map(column => (
                    <td key={column.key} className="py-3 px-4">{item[column.key]}</td>
                  ))}
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={getColumns().length} className="py-6 text-center text-gray-500">
                    No data found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} entries
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm">
            {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="flex items-center"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Options</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto py-4">
            <FilterDialogContent 
              filterOptions={filterOptions} 
              activeFilters={activeFilters}
              onApply={applyFilters}
            />
          </div>
          <DialogFooter className="justify-between">
            <Button 
              variant="ghost" 
              onClick={() => closeFilterDialog()}
            >
              Cancel
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => clearAllFilters()}
              className="text-red-500"
            >
              Clear All Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Filter Dialog Component
function FilterDialogContent({ filterOptions, activeFilters, onApply }) {
  const [localFilters, setLocalFilters] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  
  // Initialize local filters with active filters
  useEffect(() => {
    setLocalFilters({...activeFilters});
  }, [activeFilters]);
  
  const updateSearch = (key, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const toggleFilterValue = (key, value) => {
    setLocalFilters(prev => {
      const newFilters = {...prev};
      
      if (!newFilters[key]) {
        newFilters[key] = [value];
      } else if (newFilters[key].includes(value)) {
        newFilters[key] = newFilters[key].filter(v => v !== value);
        if (newFilters[key].length === 0) {
          delete newFilters[key];
        }
      } else {
        newFilters[key] = [...newFilters[key], value];
      }
      
      return newFilters;
    });
  };
  
  const applyFilters = () => {
    onApply(localFilters);
  };
  
  return (
    <div className="space-y-4">
      {Object.entries(filterOptions).map(([key, values]) => {
        // Filter values based on search query
        const searchQuery = searchQueries[key] || '';
        const filteredValues = values.filter(value => 
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return (
          <div key={key} className="space-y-2">
            <Label className="font-medium">{key}</Label>
            <Input 
              placeholder={`Search ${key}...`}
              value={searchQueries[key] || ''}
              onChange={(e) => updateSearch(key, e.target.value)}
              className="mb-2"
            />
            <div className="max-h-40 overflow-y-auto space-y-2 pl-1">
              {filteredValues.map((value, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${key}-${index}`}
                    checked={localFilters[key]?.includes(value) || false}
                    onCheckedChange={() => toggleFilterValue(key, value)}
                  />
                  <Label htmlFor={`${key}-${index}`} className="text-sm cursor-pointer">
                    {value}
                  </Label>
                </div>
              ))}
              {filteredValues.length === 0 && (
                <div className="text-sm text-gray-500 italic">No matching options</div>
              )}
            </div>
          </div>
        );
      })}
      <Button 
        onClick={applyFilters}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white"
      >
        Apply Filters
      </Button>
    </div>
  );
}