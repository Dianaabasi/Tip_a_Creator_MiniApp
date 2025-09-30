// Seed script for Firestore - Run with: node scripts/seed-firestore.js
const admin = require("firebase-admin")

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}

const db = admin.firestore()

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Sample creators
    const sampleCreators = [
      {
        address: "0x1234567890123456789012345678901234567890",
        handle: "alice",
        avatar: "https://i.imgur.com/placeholder1.jpg",
        bio: "Digital artist and NFT creator",
        totalTips: 150.5,
        tipCount: 12,
        fid: 1001,
      },
      {
        address: "0x2345678901234567890123456789012345678901",
        handle: "bob",
        avatar: "https://i.imgur.com/placeholder2.jpg",
        bio: "Crypto educator and content creator",
        totalTips: 89.25,
        tipCount: 7,
        fid: 1002,
      },
      {
        address: "0x3456789012345678901234567890123456789012",
        handle: "charlie",
        avatar: "https://i.imgur.com/placeholder3.jpg",
        bio: "DeFi researcher and writer",
        totalTips: 234.75,
        tipCount: 18,
        fid: 1003,
      },
    ]

    // Add creators
    for (const creator of sampleCreators) {
      await db
        .collection("creators")
        .doc(creator.address)
        .set({
          ...creator,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      console.log(`Added creator: ${creator.handle}`)
    }

    // Sample tips
    const sampleTips = [
      {
        tipperAddress: "0x9876543210987654321098765432109876543210",
        tipperFid: 2001,
        tipperHandle: "supporter1",
        creatorAddress: sampleCreators[0].address,
        creatorHandle: sampleCreators[0].handle,
        amount: 25.0,
        token: "USDC",
        txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        message: "Love your art!",
        status: "completed",
      },
      {
        tipperAddress: "0x8765432109876543210987654321098765432109",
        tipperFid: 2002,
        tipperHandle: "supporter2",
        creatorAddress: sampleCreators[1].address,
        creatorHandle: sampleCreators[1].handle,
        amount: 10.0,
        token: "USDC",
        txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
        message: "Great educational content!",
        status: "completed",
      },
    ]

    // Add tips
    for (const tip of sampleTips) {
      await db.collection("tips").add({
        ...tip,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      console.log(`Added tip: ${tip.amount} ${tip.token} to ${tip.creatorHandle}`)
    }

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    process.exit(0)
  }
}

// Run the seeding
seedDatabase()
