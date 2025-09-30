"use client"

import { useState, useEffect } from "react"
import { useAuthenticate } from "@coinbase/onchainkit/minikit"
import { useToast } from "./Toast"

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuthenticate()
  const { showToast } = useToast()

  useEffect(() => {
    if (user?.address) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?address=${user.address}`)
      const data = await response.json()

      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      showToast("Failed to load notifications", "error")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })

      setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: user.address }),
      })

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
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
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-primary-600 hover:text-primary-700">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <span className="text-4xl mb-2 block">🔔</span>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationItem({ notification, onMarkAsRead }) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "tip_received":
        return "💰"
      case "milestone_reached":
        return "🎉"
      case "new_follower":
        return "👋"
      default:
        return "🔔"
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div
      onClick={handleClick}
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        notification.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200 hover:bg-blue-100"
      }`}
    >
      <div className="flex items-start space-x-3">
        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-600">{notification.body}</p>
          <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
        </div>
        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>}
      </div>
    </div>
  )
}
