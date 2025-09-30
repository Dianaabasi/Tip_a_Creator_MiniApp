"use client"

import { useState, useEffect } from "react"
import { useAuthenticate } from "@coinbase/onchainkit/minikit"
import { useToast } from "./Toast"

export default function TipHistory({ creatorAddress = null, showTipper = false, limit = 10 }) {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthenticate()
  const { showToast } = useToast()

  useEffect(() => {
    fetchTips()
  }, [creatorAddress, user])

  const fetchTips = async () => {
    try {
      const params = new URLSearchParams()
      if (creatorAddress) {
        params.append("creator", creatorAddress)
      } else if (user?.address) {
        params.append("address", user.address)
      }
      params.append("limit", limit.toString())

      const response = await fetch(`/api/tips?${params}`)
      const data = await response.json()
      setTips(data.tips || [])
    } catch (error) {
      console.error("Error fetching tips:", error)
      showToast("Failed to load tip history", "error")
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

  if (tips.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No tips found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tips.map((tip) => (
        <TipItem key={tip.id} tip={tip} showTipper={showTipper} />
      ))}
    </div>
  )
}

function TipItem({ tip, showTipper }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-primary-600">
            {tip.amount} {tip.token}
          </span>
          {showTipper ? (
            <span className="text-sm text-gray-600">from @{tip.tipperHandle || "Anonymous"}</span>
          ) : (
            <span className="text-sm text-gray-600">to @{tip.creatorHandle}</span>
          )}
        </div>
        {tip.message && <p className="text-sm text-gray-700 mb-1">"{tip.message}"</p>}
        <div className="text-xs text-gray-500">{formatDate(tip.createdAt)}</div>
      </div>
      <div className="text-right">
        <a
          href={`https://basescan.org/tx/${tip.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-600 hover:underline"
        >
          View TX
        </a>
      </div>
    </div>
  )
}
