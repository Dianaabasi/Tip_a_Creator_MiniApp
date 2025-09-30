import { NextResponse } from "next/server"
import { markAllNotificationsAsRead } from "../../../../lib/firebaseAdmin"

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 })
    }

    await markAllNotificationsAsRead(address)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
