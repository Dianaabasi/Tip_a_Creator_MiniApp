"use client"

import { useFrame } from "./FrameProvider"
import { useEffect, useState } from "react"

export default function FrameLayout({ children }) {
  const { isFrameContext, frameData } = useFrame()
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 })

  useEffect(() => {
    if (isFrameContext) {
      // Adjust layout for frame context
      const updateDimensions = () => {
        const width = Math.min(window.innerWidth, 400)
        const height = Math.min(window.innerHeight, 600)
        setDimensions({ width, height })
      }

      updateDimensions()
      window.addEventListener("resize", updateDimensions)

      return () => window.removeEventListener("resize", updateDimensions)
    }
  }, [isFrameContext])

  if (isFrameContext) {
    return (
      <div
        className="frame-container bg-white"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: "100vw",
          maxHeight: "100vh",
          overflow: "auto",
        }}
      >
        <div className="frame-content p-4">{children}</div>
      </div>
    )
  }

  // Regular web layout
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">{children}</div>
    </div>
  )
}
