"use client"

import { useState, useEffect } from "react"
import { Loader2, Play, RefreshCw, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CONFIG from "@/lib/config"
import toast from "react-hot-toast"

export default function SystemJobs() {
  const [jobLogs, setJobLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(null)

  const getAuthToken = () => localStorage.getItem("authToken")

  const fetchJobLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/job-log`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.status === "success") {
          setJobLogs(Array.isArray(json.data) ? json.data : [])
        }
      }
    } catch {
      // Job logs are supplementary
    } finally {
      setLoading(false)
    }
  }

  const triggerJob = async (jobType) => {
    setTriggering(jobType)
    try {
      const endpoint = jobType === "commission"
        ? "/api/commission-cron"
        : jobType === "monthly-rec"
        ? "/api/monthly-rec-data/aggregate"
        : "/api/historical-collection/run"

      const res = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        toast.success(`${jobType} job triggered successfully`)
        fetchJobLogs()
      } else {
        const json = await res.json().catch(() => ({}))
        toast.error(json.message || `Failed to trigger ${jobType} job`)
      }
    } catch {
      toast.error(`Error triggering ${jobType} job`)
    } finally {
      setTriggering(null)
    }
  }

  useEffect(() => {
    fetchJobLogs()
  }, [])

  const formatDate = (d) => {
    if (!d) return "-"
    return new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase()
    if (s === "SUCCESS" || s === "COMPLETED") return "bg-green-100 text-green-700"
    if (s === "FAILED" || s === "ERROR") return "bg-red-100 text-red-700"
    if (s === "RUNNING" || s === "IN_PROGRESS") return "bg-yellow-100 text-yellow-700"
    return "bg-gray-100 text-gray-600"
  }

  const jobs = [
    { id: "commission", label: "Commission Calculation", description: "Calculates partner/agent commissions for the current period" },
    { id: "monthly-rec", label: "Monthly REC Aggregation", description: "Aggregates facility REC data for the current month" },
    { id: "historical", label: "Historical Data Collection", description: "Collects and processes historical meter data" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sfpro text-lg font-semibold text-[#1E1E1E]">System Jobs</h2>
        <Button variant="outline" size="sm" onClick={fetchJobLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Job Trigger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border border-gray-200 rounded-xl">
            <CardContent className="p-4">
              <h3 className="font-sfpro text-sm font-semibold text-[#1E1E1E] mb-1">{job.label}</h3>
              <p className="font-sfpro text-xs text-[#626060] mb-3">{job.description}</p>
              <Button
                size="sm"
                onClick={() => triggerJob(job.id)}
                disabled={triggering === job.id}
                className="bg-[#039994] text-white hover:bg-[#028884] w-full"
              >
                {triggering === job.id ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running...</>
                ) : (
                  <><Play className="h-3 w-3 mr-1" /> Run Now</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Log History */}
      <Card className="border border-gray-200 rounded-xl">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h3 className="font-sfpro text-sm font-semibold text-[#1E1E1E] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#039994]" />
              Job History
            </h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#039994]" />
            </div>
          ) : jobLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm bg-gray-50">
                    <th className="py-2 px-4 text-left font-sfpro font-medium text-[#1E1E1E]">Job Type</th>
                    <th className="py-2 px-4 text-left font-sfpro font-medium text-[#1E1E1E]">Status</th>
                    <th className="py-2 px-4 text-left font-sfpro font-medium text-[#1E1E1E]">Started</th>
                    <th className="py-2 px-4 text-left font-sfpro font-medium text-[#1E1E1E]">Completed</th>
                    <th className="py-2 px-4 text-left font-sfpro font-medium text-[#1E1E1E]">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {jobLogs.slice(0, 20).map((log, i) => (
                    <tr key={log.id || i} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-4 font-sfpro text-xs">{log.jobType || log.type || "-"}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                          {log.status || "-"}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-sfpro text-xs">{formatDate(log.startedAt || log.createdAt)}</td>
                      <td className="py-2 px-4 font-sfpro text-xs">{formatDate(log.completedAt || log.updatedAt)}</td>
                      <td className="py-2 px-4 font-sfpro text-xs text-[#626060]">{log.message || log.details || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-sfpro text-xs text-[#626060] text-center py-8">No job logs found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
