"use client"

import { useState, useEffect } from "react"
import { Loader2, Play, RefreshCw, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CONFIG from "@/lib/config"
import toast from "react-hot-toast"

export default function SystemJobs() {
  const [jobLogs, setJobLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(null)
  const [modalJob, setModalJob] = useState(null)
  const [jobParams, setJobParams] = useState({
    year: new Date().getFullYear(),
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    month: new Date().getMonth() + 1,
  })

  const getAuthToken = () => localStorage.getItem("authToken")

  const fetchJobLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/job-log`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      })
      if (res.ok) {
        const json = await res.json()
        // Handle both { status: "success", data: [...] } and { data: [...] } and direct array responses
        const logs = json.data?.logs || json.data || json.logs || (Array.isArray(json) ? json : [])
        setJobLogs(Array.isArray(logs) ? logs : [])
      }
    } catch {
      // Job logs are supplementary
    } finally {
      setLoading(false)
    }
  }

  const triggerJob = async (jobId, body) => {
    setTriggering(jobId)
    try {
      const job = jobs.find((j) => j.id === jobId)
      const res = await fetch(`${CONFIG.API_BASE_URL}${job.endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (res.ok) {
        toast.success(`${job.label} triggered successfully`)
        if (jobId === "commission") {
          toast.success("Sales agent bonus will trigger automatically in 15 minutes", { duration: 6000 })
        }
        fetchJobLogs()
      } else {
        const json = await res.json().catch(() => ({}))
        toast.error(json.message || `Failed to trigger ${job.label}`)
      }
    } catch {
      toast.error(`Error triggering job`)
    } finally {
      setTriggering(null)
      setModalJob(null)
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
    {
      id: "commission",
      label: "Commission Calculation",
      description: "Calculates partner/agent commissions for the current period",
      endpoint: "/api/commission-cron/trigger",
      hasParams: true,
    },
    {
      id: "sales-agent",
      label: "Sales Agent Bonus",
      description: "Manually triggers sales agent bonus calculation (normally auto 15min after commission)",
      endpoint: "/api/commission-cron/sales-agent",
    },
    {
      id: "partner-bonus",
      label: "Partner Bonus",
      description: "Triggers partner bonus calculation for a specific quarter",
      endpoint: "/api/bonus/trigger-bonus",
      hasParams: true,
    },
    {
      id: "monthly-rec",
      label: "Monthly REC Aggregation",
      description: "Aggregates facility REC data for a specific month and year",
      endpoint: "/api/monthly-rec-data/start",
      hasParams: true,
      paramType: "month-year",
    },
    {
      id: "historical",
      label: "Historical Data Collection",
      description: "Collects and processes historical meter data",
      endpoint: "/api/historical-collection/start",
    },
  ]

  const handleRunClick = (job) => {
    if (job.hasParams) {
      setModalJob(job.id)
      setJobParams({
        year: new Date().getFullYear(),
        quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        month: new Date().getMonth() + 1,
      })
    } else {
      triggerJob(job.id)
    }
  }

  const handleModalSubmit = () => {
    const job = jobs.find((j) => j.id === modalJob)
    if (job?.paramType === "month-year") {
      triggerJob(modalJob, { month: jobParams.month, year: jobParams.year })
    } else {
      triggerJob(modalJob, { year: jobParams.year, quarter: jobParams.quarter })
    }
  }

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
                onClick={() => handleRunClick(job)}
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

      {/* Parameter Modal for Commission / Partner Bonus */}
      {modalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sfpro text-base font-semibold text-[#1E1E1E]">
                {jobs.find((j) => j.id === modalJob)?.label || "Job Parameters"}
              </h3>
              <button onClick={() => setModalJob(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#626060] mb-1 font-sfpro">Year</label>
                <input
                  type="number"
                  value={jobParams.year}
                  onChange={(e) => setJobParams((p) => ({ ...p, year: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
                  min="2020"
                  max="2030"
                />
              </div>
              {jobs.find((j) => j.id === modalJob)?.paramType === "month-year" ? (
                <div>
                  <label className="block text-xs font-medium text-[#626060] mb-1 font-sfpro">Month</label>
                  <select
                    value={jobParams.month}
                    onChange={(e) => setJobParams((p) => ({ ...p, month: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
                  >
                    <option value={1}>January</option>
                    <option value={2}>February</option>
                    <option value={3}>March</option>
                    <option value={4}>April</option>
                    <option value={5}>May</option>
                    <option value={6}>June</option>
                    <option value={7}>July</option>
                    <option value={8}>August</option>
                    <option value={9}>September</option>
                    <option value={10}>October</option>
                    <option value={11}>November</option>
                    <option value={12}>December</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-[#626060] mb-1 font-sfpro">Quarter</label>
                  <select
                    value={jobParams.quarter}
                    onChange={(e) => setJobParams((p) => ({ ...p, quarter: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
                  >
                    <option value={1}>Q1 (Jan - Mar)</option>
                    <option value={2}>Q2 (Apr - Jun)</option>
                    <option value={3}>Q3 (Jul - Sep)</option>
                    <option value={4}>Q4 (Oct - Dec)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" size="sm" onClick={() => setModalJob(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleModalSubmit}
                disabled={!!triggering}
                className="bg-[#039994] text-white hover:bg-[#028884]"
              >
                {triggering ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running...</>
                ) : (
                  <><Play className="h-3 w-3 mr-1" /> Run</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
