"use client"

import { useState } from "react"
import { useAuthenticate } from "@coinbase/onchainkit/minikit"
import TipModal from "./TipModal"
import { useToast } from "./Toast"

export default function TipButton({ creator, size = "md", className = "", disabled = false }) {
  const [showModal, setShowModal] = useState(false)
  const { isAuthenticated } = useAuthenticate()
  const { showToast } = useToast()

  const handleClick = () => {
    if (!isAuthenticated) {
      showToast("Please connect your wallet first", "error")
      return
    }
    setShowModal(true)
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <>
      <button onClick={handleClick} disabled={disabled} className={`btn-primary ${sizeClasses[size]} ${className}`}>
        💰 Tip
      </button>

      {showModal && <TipModal creator={creator} onClose={() => setShowModal(false)} />}
    </>
  )
}
