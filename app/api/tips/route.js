import { NextResponse } from "next/server"
import { saveTip, getTipsByAddress, getTipsByCreator } from "../../../lib/firebaseAdmin"
import { validateTipData } from "../../../lib/firestore-utils"

// POST /api/tips - Create a new tip
export async function POST(request) {
  try {
    const body = await request.json()
    const { creatorHandle, creatorAddress, amount, token, txHash, message, auth } = body

    // Validate authentication
    if (!auth || !auth.address) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Validate tip data
    const tipData = {
      tipperAddress: auth.address,
      tipperFid: auth.fid || null,
      tipperHandle: auth.handle || null,
      creatorAddress,
      creatorHandle,
      amount: Number(amount),
      token,
      txHash,
      message: message || "",
      status: "completed",
    }

    const validationErrors = validateTipData(tipData)
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Invalid tip data", details: validationErrors }, { status: 400 })
    }

    // Save tip to database
    const tipId = await saveTip(tipData)

    return NextResponse.json({ success: true, tipId })
  } catch (error) {
    console.error("Error creating tip:", error)
    return NextResponse.json({ error: "Failed to create tip" }, { status: 500 })
  }
}

// GET /api/tips - Get tips for an address
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const creator = searchParams.get("creator")
    const limit = parseInt(searchParams.get("limit")) || 10

    if (!address && !creator) {
      return NextResponse.json({ error: "Address or creator parameter required" }, { status: 400 })
    }

    let tips
    if (creator) {
      tips = await getTipsByCreator(creator, limit)
    } else {
      tips = await getTipsByAddress(address, limit)
    }

    return NextResponse.json({ tips })
  } catch (error) {
    console.error("Error fetching tips:", error)
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 })
  }
}
