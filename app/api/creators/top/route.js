import { NextResponse } from "next/server"
import { getTopCreators } from "../../../../lib/firebaseAdmin"
import Logger from "../../../../lib/logger"

// GET /api/creators/top - Get top creators by tips received
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit")) || 10

    const creators = await getTopCreators(limit)

    return NextResponse.json({ creators })
  } catch (error) {
    Logger.error("Failed to fetch top creators", {
      errorType: error.constructor.name,
      message: error.message,
      endpoint: "/api/creators/top"
    })
    
    return NextResponse.json({ 
      error: "Failed to fetch creators",
      message: "Unable to load creator data. Please try again later."
    }, { status: 500 })
  }
}
