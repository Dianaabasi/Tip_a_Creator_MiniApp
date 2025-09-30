import { NextResponse } from "next/server"
import { markNotificationAsRead } from "../../../../../lib/firebaseAdmin"

// POST /api/notifications/[id]/read - Mark notification as read
export async function POST(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    await markNotificationAsRead(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
