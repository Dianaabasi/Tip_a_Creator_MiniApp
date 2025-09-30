import { NextResponse } from "next/server"
import { saveNotification } from "../../../../lib/firebaseAdmin"

// POST /api/notifications/send - Send notification to creator
export async function POST(request) {
  try {
    const body = await request.json()
    const { creatorAddress, type, data } = body

    if (!creatorAddress || !type) {
      return NextResponse.json({ error: "Creator address and type required" }, { status: 400 })
    }

    // Create notification data
    const notificationData = {
      recipientAddress: creatorAddress,
      type,
      data,
      title: getNotificationTitle(type, data),
      body: getNotificationBody(type, data),
    }

    const notificationId = await saveNotification(notificationData)

    return NextResponse.json({ success: true, notificationId })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

function getNotificationTitle(type, data) {
  switch (type) {
    case "tip_received":
      return `💰 New tip received!`
    case "milestone_reached":
      return `🎉 Milestone reached!`
    case "new_follower":
      return `👋 New follower!`
    default:
      return "🔔 New notification"
  }
}

function getNotificationBody(type, data) {
  switch (type) {
    case "tip_received":
      return `You received ${data.amount} ${data.token} from ${data.tipperHandle || "Anonymous"}${data.message ? `: "${data.message}"` : ""}`
    case "milestone_reached":
      return data.message || `You've reached a new milestone!`
    case "new_follower":
      return `${data.followerHandle || "Someone"} started following you!`
    default:
      return "You have a new notification"
  }
}
