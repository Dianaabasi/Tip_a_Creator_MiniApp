"use client"

import { useState, useEffect } from "react"
import { useAuthenticate } from "@coinbase/onchainkit/minikit"
import CreatorDashboard from "../../components/CreatorDashboard"
import NotificationCenter from "../../components/NotificationCenter"
import { useToast, ToastProvider } from "../../components/Toast"
import { FrameProvider } from "../../components/FrameProvider"
import FrameLayout from "../../components/FrameLayout"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <FrameProvider>
      <ToastProvider>
        <FrameLayout>
          <DashboardContent />
        </FrameLayout>
      </ToastProvider>
    </FrameProvider>
  )
}

function DashboardContent() {
  const { user, isAuthenticated } = useAuthenticate()
  const { showToast } = useToast()

  if (!isAuthenticated) {
    return (
      <div className="frame-content">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-gray-600 mb-4">Please connect your wallet to view your dashboard</p>
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
        <h1 className="text-2xl font-bold">Creator Dashboard</h1>
        <Link href="/" className="btn-secondary text-sm">
          ← Back
        </Link>
      </div>

      <div className="space-y-6">
        <CreatorDashboard />
        <NotificationCenter />
      </div>
    </div>
  )
}
