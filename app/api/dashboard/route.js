import { NextResponse } from "next/server"
import { getDashboardStats } from "../../../lib/firebaseAdmin"

// GET /api/dashboard - Get dashboard stats for an address
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter required" }, { status: 400 })
    }

    const stats = await getDashboardStats(address)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
