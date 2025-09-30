"use client"

import { useState, useEffect } from "react"
import { useAuthenticate } from "@coinbase/onchainkit/minikit"
import TipButton from "../../../components/TipButton"
import TipHistory from "../../../components/TipHistory"
import { useToast, ToastProvider } from "../../../components/Toast"
import { FrameProvider } from "../../../components/FrameProvider"
import FrameLayout from "../../../components/FrameLayout"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage({ params }) {
  return <ProfileContent handle={params.handle} />
}

function ProfileContent({ handle }) {
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuthenticate()
  const { showToast } = useToast()

  useEffect(() => {
    fetchCreatorProfile()
  }, [handle])

  const fetchCreatorProfile = async () => {
    try {
      const response = await fetch(`/api/creators/${handle}`)
      const data = await response.json()
      
      if (data.error) {
        showToast("Creator not found", "error")
        setCreator(null)
      } else {
        setCreator(data.creator)
      }
    } catch (error) {
      console.error("Error fetching creator profile:", error)
      showToast("Failed to load creator profile", "error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="frame-content">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="frame-content">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Creator Not Found</h1>
          <p className="text-gray-600 mb-4">The creator @{handle} could not be found</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="frame-content">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="btn-secondary text-sm">
          ← Back
        </Link>
      </div>

      {/* Creator Profile Header */}
      <div className="card text-center mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          {creator.avatar ? (
            <Image
              src={creator.avatar}
              alt={creator.handle}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-600">
              {creator.handle?.charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">@{creator.handle}</h1>
        
        {creator.bio && (
          <p className="text-gray-600 mb-4">{creator.bio}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-primary-600">${creator.totalTips || 0}</div>
            <div className="text-sm text-gray-600">Total Received</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-primary-600">{creator.tipCount || 0}</div>
            <div className="text-sm text-gray-600">Tips Received</div>
          </div>
        </div>

        {isAuthenticated && (
          <TipButton creator={creator} size="lg" />
        )}
      </div>

      {/* Recent Tips */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Tips</h3>
        <TipHistory creatorAddress={creator.address} showTipper={true} limit={10} />
      </div>
    </div>
  )
}
