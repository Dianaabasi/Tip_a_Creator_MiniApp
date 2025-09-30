"use client"

import { createContext, useContext, useState, useEffect } from "react"

const FrameContext = createContext()

export function FrameProvider({ children }) {
  const [isFrameContext, setIsFrameContext] = useState(false)
  const [frameData, setFrameData] = useState(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Detect if running in frame context
    const detectFrameContext = () => {
      try {
        // Check for Farcaster frame context
        const urlParams = new URLSearchParams(window.location.search)
        const frameParam = urlParams.get("frame")

        if (frameParam || window.parent !== window) {
          setIsFrameContext(true)
          setFrameData({
            source: "farcaster",
            castHash: urlParams.get("castHash"),
            fid: urlParams.get("fid"),
          })
        }
      } catch (error) {
        // Frame detection error - silently handle
      }
    }

    detectFrameContext()
  }, [isClient])

  return <FrameContext.Provider value={{ isFrameContext, frameData }}>{children}</FrameContext.Provider>
}

export function useFrame() {
  const context = useContext(FrameContext)
  if (!context) {
    throw new Error("useFrame must be used within FrameProvider")
  }
  return context
}
