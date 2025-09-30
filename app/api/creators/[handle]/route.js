import { NextResponse } from "next/server"
import { getCreatorByHandle } from "../../../../lib/firebaseAdmin"

// GET /api/creators/[handle] - Get creator profile by handle
export async function GET(request, { params }) {
  try {
    const { handle } = params

    if (!handle) {
      return NextResponse.json({ error: "Handle parameter required" }, { status: 400 })
    }

    const creator = await getCreatorByHandle(handle)

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    return NextResponse.json({ creator })
  } catch (error) {
    console.error("Error fetching creator:", error)
    return NextResponse.json({ error: "Failed to fetch creator" }, { status: 500 })
  }
}
