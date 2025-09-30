"use client"

import { useState, useEffect } from "react"
import { useAuthenticate } from "@coinbase/onchainkit/minikit"
import TipHistory from "../../components/TipHistory"
import { useToast, ToastProvider } from "../../components/Toast"
import { FrameProvider } from "../../components/FrameProvider"
import FrameLayout from "../../components/FrameLayout"
import Link from "next/link"

export default function HistoryPage() {
  return (
    <FrameProvider>
      <ToastProvider>
        <FrameLayout>
          <HistoryContent />
        </FrameLayout>
      </ToastProvider>
    </FrameProvider>
  )
}

function HistoryContent() {
  const { user, isAuthenticated } = useAuthenticate()
  const { showToast } = useToast()

  if (!isAuthenticated) {
    return (
      <div className="frame-content">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">My Tips</h1>
          <p className="text-gray-600 mb-4">Please connect your wallet to view your tip history</p>
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
        <h1 className="text-2xl font-bold">My Tips</h1>
        <Link href="/" className="btn-secondary text-sm">
          ← Back
        </Link>
      </div>

      <TipHistory />
    </div>
  )
}
