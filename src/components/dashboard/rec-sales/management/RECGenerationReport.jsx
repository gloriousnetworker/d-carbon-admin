"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CONFIG from "@/lib/config"

function formatDate(d) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) } catch { return "—" }
}

export default function RECGenerationReport() {
  const [currentPage, setCurrentPage] = useState(1)
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const limit = 10

  const totalPages = Math.ceil(reportData.length / limit)
  const currentItems = reportData.slice((currentPage - 1) * limit, currentPage * limit)

  useEffect(() => {
    const fetchRecData = async () => {
      setLoading(true)
      setError(null)
      try {
        const authToken = localStorage.getItem("authToken")
        if (!authToken) throw new Error("Authentication token not found")

        // Fetch REC sales data
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/rec/?page=1&limit=500`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        const sales = json.status === "success"
          ? Array.isArray(json.data) ? json.data : json.data?.recSales || json.data?.sales || json.data?.records || []
          : []

        // Also fetch current REC price for context
        let currentPrice = null
        try {
          const priceRes = await fetch(`${CONFIG.API_BASE_URL}/api/rec/price/current`, {
            headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
          })
          if (priceRes.ok) {
            const priceJson = await priceRes.json()
            currentPrice = priceJson.data?.price || priceJson.data?.currentPrice || null
          }
        } catch { /* price fetch is optional */ }

        const mapped = sales.map((sale) => ({
          id: sale.id,
          startDate: formatDate(sale.startDate || sale.periodStart || sale.createdAt),
          endDate: formatDate(sale.endDate || sale.periodEnd),
          vintage: sale.vintage || sale.period || "—",
          mwhReported: sale.totalMWh != null ? Number(sale.totalMWh).toFixed(3)
            : sale.totalKWh != null ? (Number(sale.totalKWh) / 1000).toFixed(3)
            : sale.quantity != null ? Number(sale.quantity).toFixed(3) : "—",
          location: sale.location || sale.state || "California",
          recsGenerated: sale.recsGenerated ?? sale.totalRecs ?? sale.quantity ?? "—",
          recsSold: sale.recsSold ?? sale.soldQuantity ?? "—",
          avgPrice: sale.averagePrice != null ? `$${Number(sale.averagePrice).toFixed(2)}`
            : sale.pricePerRec != null ? `$${Number(sale.pricePerRec).toFixed(2)}`
            : currentPrice != null ? `$${Number(currentPrice).toFixed(2)}` : "—",
          totalSales: sale.totalAmount != null ? `$${Number(sale.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            : sale.totalRevenue != null ? `$${Number(sale.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—",
          buyer: sale.buyer?.name || sale.buyerName || "—",
          status: sale.status || "—",
        }))

        setReportData(mapped)
      } catch (err) {
        console.error("Error fetching REC generation data:", err)
        setError(err.message)
        setReportData([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecData()
  }, [])

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#039994]">
            REC Generation Report
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-sfpro">
              {reportData.length} record{reportData.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y text-sm">
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">S/N</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">Start Date</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">End Date</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">Vintage</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">MWh Reported</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">Location</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">RECs Generated</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">RECs Sold</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">Buyer</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">Avg. Price</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">Total Sales</th>
                <th className="py-3 px-2 text-left font-medium font-sfpro text-[#1E1E1E]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-gray-500 font-sfpro">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                    Loading REC data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-red-500 font-sfpro">
                    Failed to load data: {error}
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-gray-500 font-sfpro">
                    No REC generation records found
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.id || index} className="border-b text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 font-sfpro">{(currentPage - 1) * limit + index + 1}</td>
                    <td className="py-3 px-2 font-sfpro">{item.startDate}</td>
                    <td className="py-3 px-2 font-sfpro">{item.endDate}</td>
                    <td className="py-3 px-2 font-sfpro">{item.vintage}</td>
                    <td className="py-3 px-2 font-sfpro">{item.mwhReported}</td>
                    <td className="py-3 px-2 font-sfpro">{item.location}</td>
                    <td className="py-3 px-2 font-sfpro">{item.recsGenerated}</td>
                    <td className="py-3 px-2 font-sfpro">{item.recsSold}</td>
                    <td className="py-3 px-2 font-sfpro">{item.buyer}</td>
                    <td className="py-3 px-2 font-sfpro">{item.avgPrice}</td>
                    <td className="py-3 px-2 font-sfpro">{item.totalSales}</td>
                    <td className="py-3 px-2 font-sfpro">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "COMPLETED" || item.status === "completed" ? "bg-green-100 text-green-700"
                        : item.status === "PENDING" || item.status === "pending" ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-4 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-sfpro">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
