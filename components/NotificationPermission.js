"use client"

import { useState, useEffect } from "react"
import { useMiniKit } from "@coinbase/onchainkit"
import { useToast } from "./Toast"

export default function NotificationPermission() {
  const [permissionStatus, setPermissionStatus] = useState("default")
  const [showPrompt, setShowPrompt] = useState(false)
  const { isFrameContext, requestNotificationPermission } = useMiniKit()
  const { showToast } = useToast()

  useEffect(() => {
    checkNotificationPermission()
  }, [])

  const checkNotificationPermission = async () => {
    if (!isFrameContext) return

    try {
      // Check current permission status
      const permission = await Notification.permission
      setPermissionStatus(permission)

      // Show prompt if permission is default and user hasn't dismissed it
      const hasPrompted = localStorage.getItem("notification-prompted")
      if (permission === "default" && !hasPrompted) {
        setShowPrompt(true)
      }
    } catch (error) {
      console.error("Error checking notification permission:", error)
    }
  }

  const requestPermission = async () => {
    try {
      const permission = await requestNotificationPermission()
      setPermissionStatus(permission)

      if (permission === "granted") {
        showToast("Notifications enabled! You'll receive updates when you get tips.", "success")

        // Register notification token with backend
        await registerNotificationToken()
      } else {
        showToast("Notifications disabled. You can enable them later in settings.", "info")
      }

      setShowPrompt(false)
      localStorage.setItem("notification-prompted", "true")
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      showToast("Failed to enable notifications", "error")
    }
  }

  const registerNotificationToken = async () => {
    try {
      // This would typically get the actual notification token from MiniKit
      const token = "mock-notification-token-" + Date.now()

      const response = await fetch("/api/notifications/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          platform: "minikit",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to register notification token")
      }
    } catch (error) {
      console.error("Error registering notification token:", error)
    }
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    localStorage.setItem("notification-prompted", "true")
  }

  if (!isFrameContext || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-2xl">🔔</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Enable Notifications</h3>
          <p className="text-sm text-gray-600 mb-3">Get notified when you receive tips and reach milestones!</p>
          <div className="flex space-x-2">
            <button onClick={requestPermission} className="btn-primary text-sm px-3 py-1.5">
              Enable
            </button>
            <button onClick={dismissPrompt} className="btn-secondary text-sm px-3 py-1.5">
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
