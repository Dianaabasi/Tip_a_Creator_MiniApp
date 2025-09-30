import { NextResponse } from "next/server"
import { getNotificationsByAddress } from "../../../lib/firebaseAdmin"

// GET /api/notifications - Get notifications for an address
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const limit = parseInt(searchParams.get("limit")) || 20

    if (!address) {
      return NextResponse.json({ error: "Address parameter required" }, { status: 400 })
    }

    const notifications = await getNotificationsByAddress(address, limit)
    const unreadCount = notifications.filter((n) => !n.read).length

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
