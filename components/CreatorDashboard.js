"use client"

import { useState, useEffect } from "react"
import { useAuthenticate } from "@coinbase/onchainkit/minikit"
import TipHistory from "./TipHistory"
import { useToast } from "./Toast"

export default function CreatorDashboard() {
  const [stats, setStats] = useState({
    totalTips: 0,
    totalAmount: 0,
    tipCount: 0,
    topSupporters: [],
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuthenticate()
  const { showToast } = useToast()

  useEffect(() => {
    if (user?.address) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/dashboard?address=${user.address}`)
      const data = await response.json()
      setStats(data.stats || {})
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      showToast("Failed to load dashboard", "error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">${stats.totalAmount || 0}</div>
          <div className="text-sm text-gray-600">Total Received</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.tipCount || 0}</div>
          <div className="text-sm text-gray-600">Tips Received</div>
        </div>
      </div>

      {/* Top Supporters */}
      {stats.topSupporters && stats.topSupporters.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Supporters</h3>
          <div className="space-y-2">
            {stats.topSupporters.map((supporter, index) => (
              <div key={supporter.address} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="font-medium">@{supporter.handle || "Anonymous"}</span>
                </div>
                <span className="text-primary-600 font-medium">${supporter.totalAmount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tips */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Tips Received</h3>
        <TipHistory creatorAddress={user?.address} showTipper={true} limit={10} />
      </div>
    </div>
  )
}
