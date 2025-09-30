// Notification system for MiniKit integration
import { useMiniKit } from "@coinbase/onchainkit"

export class NotificationManager {
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_APP_URL
    this.secret = process.env.NOTIFICATION_SECRET
  }

  // Send notification via MiniKit API
  async sendNotification(recipientAddress, type, data) {
    try {
      const response = await fetch(`${this.apiUrl}/api/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorAddress: recipientAddress,
          type,
          data,
        }),
      })

      if (!response.ok) {
        throw new Error(`Notification failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Failed to send notification:", error)
      throw error
    }
  }

  // Send tip received notification
  async notifyTipReceived(creatorAddress, tipData) {
    return this.sendNotification(creatorAddress, "tip_received", {
      amount: tipData.amount,
      token: tipData.token,
      tipperHandle: tipData.tipperHandle || "Anonymous",
      message: tipData.message || "",
      txHash: tipData.txHash,
    })
  }

  // Send milestone notification (e.g., reached $100 in tips)
  async notifyMilestone(creatorAddress, milestone) {
    return this.sendNotification(creatorAddress, "milestone_reached", {
      milestone: milestone.type,
      value: milestone.value,
      message: milestone.message,
    })
  }

  // Send new follower notification
  async notifyNewFollower(creatorAddress, followerData) {
    return this.sendNotification(creatorAddress, "new_follower", {
      followerHandle: followerData.handle,
      followerFid: followerData.fid,
    })
  }
}

// Hook for using notifications in components
export function useNotifications() {
  const { isFrameContext } = useMiniKit()
  const notificationManager = new NotificationManager()

  const sendTipNotification = async (creatorAddress, tipData) => {
    if (!isFrameContext) {
      console.warn("Notifications only available in MiniKit context")
      return
    }

    try {
      return await notificationManager.notifyTipReceived(creatorAddress, tipData)
    } catch (error) {
      console.error("Failed to send tip notification:", error)
    }
  }

  const sendMilestoneNotification = async (creatorAddress, milestone) => {
    if (!isFrameContext) {
      console.warn("Notifications only available in MiniKit context")
      return
    }

    try {
      return await notificationManager.notifyMilestone(creatorAddress, milestone)
    } catch (error) {
      console.error("Failed to send milestone notification:", error)
    }
  }

  return {
    sendTipNotification,
    sendMilestoneNotification,
    isNotificationAvailable: isFrameContext,
  }
}

// Notification templates
export const NotificationTemplates = {
  tipReceived: (amount, token, tipperHandle, message) => ({
    title: "💰 New Tip Received!",
    body: `You received ${amount} ${token} from @${tipperHandle}${message ? `: "${message}"` : ""}`,
    icon: "/icon.jpg",
    badge: "/icon.jpg",
    data: {
      type: "tip_received",
      amount: amount.toString(),
      token,
      tipperHandle,
      message: message || "",
      url: "/dashboard",
    },
  }),

  milestoneReached: (milestone, value) => ({
    title: "🎉 Milestone Reached!",
    body: `Congratulations! You've reached ${milestone}: ${value}`,
    icon: "/icon.jpg",
    badge: "/icon.jpg",
    data: {
      type: "milestone_reached",
      milestone,
      value: value.toString(),
      url: "/dashboard",
    },
  }),

  newFollower: (followerHandle) => ({
    title: "👋 New Follower!",
    body: `@${followerHandle} started following you`,
    icon: "/icon.jpg",
    badge: "/icon.jpg",
    data: {
      type: "new_follower",
      followerHandle,
      url: "/dashboard",
    },
  }),
}
