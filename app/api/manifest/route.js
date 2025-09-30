// import { NextResponse } from "next/server"

// // GET /api/manifest - Farcaster manifest endpoint
// export async function GET() {
//   try {
//     const manifest = {
//       name: "Tip-a-Creator",
//       description: "Support creators with USDC tips on Base",
//       icon: `${process.env.NEXT_PUBLIC_APP_URL}/icon.jpg`,
//       appUrl: process.env.NEXT_PUBLIC_APP_URL,
//       appId: "tip-a-creator",
//       version: "1.0.0",
//       supportedNetworks: ["base"],
//       supportedTokens: ["USDC"],
//       features: ["tips", "notifications", "dashboard"],
//     }

//     return NextResponse.json(manifest, {
//       headers: {
//         "Content-Type": "application/json",
//         "Cache-Control": "public, max-age=3600",
//       },
//     })
//   } catch (error) {
//     console.error("Error generating manifest:", error)
//     return NextResponse.json({ error: "Failed to generate manifest" }, { status: 500 })
//   }
// }
