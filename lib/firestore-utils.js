// Utility functions for Firestore operations
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"

// Client-side Firestore utilities (for use in React components)

export async function getCreatorProfile(handle) {
  try {
    const q = query(collection(db, "creators"), where("handle", "==", handle), limit(1))

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const docData = snapshot.docs[0]
    return {
      id: docData.id,
      ...docData.data(),
    }
  } catch (error) {
    console.error("Error getting creator profile:", error)
    throw error
  }
}

export async function getUserTips(userAddress, limitCount = 10) {
  try {
    const q = query(
      collection(db, "tips"),
      where("tipperAddress", "==", userAddress),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
    }))
  } catch (error) {
    console.error("Error getting user tips:", error)
    throw error
  }
}

export async function subscribeToTips(creatorAddress, callback) {
  // Real-time subscription for tips (optional enhancement)
  const q = query(
    collection(db, "tips"),
    where("creatorAddress", "==", creatorAddress),
    orderBy("createdAt", "desc"),
    limit(10),
  )

  // Return unsubscribe function
  return onSnapshot(q, (snapshot) => {
    const tips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
    }))
    callback(tips)
  })
}

// Validation utilities
export function validateTipData(tipData) {
  const errors = []

  if (!tipData.amount || tipData.amount <= 0) {
    errors.push("Invalid amount")
  }

  if (!tipData.creatorAddress || !tipData.creatorAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    errors.push("Invalid creator address")
  }

  if (!tipData.txHash || !tipData.txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
    errors.push("Invalid transaction hash")
  }

  if (!tipData.token || !["USDC", "ETH"].includes(tipData.token)) {
    errors.push("Invalid token")
  }

  return errors
}

// Format utilities
export function formatTipAmount(amount, token) {
  return `${Number(amount).toFixed(2)} ${token}`
}

export function formatTipDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
