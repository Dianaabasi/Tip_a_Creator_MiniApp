import admin from "firebase-admin"
import Logger from "./logger"

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }

    // Validate required fields
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error("Firebase configuration incomplete: Missing required environment variables")
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  } catch (error) {
    Logger.error("Firebase initialization failed", { 
      errorType: error.constructor.name,
      message: error.message 
    })
    
    if (error.message.includes("Invalid PEM formatted message")) {
      throw new Error("Firebase private key format is invalid. Please check FIREBASE_PRIVATE_KEY in .env.local")
    }
    throw new Error(`Firebase initialization failed: ${error.message}`)
  }
}

const db = admin.firestore()

// Collections
const COLLECTIONS = {
  TIPS: "tips",
  USERS: "users",
  CREATORS: "creators",
  NOTIFICATIONS: "notifications",
}

// Tip Management Functions
export async function saveTip(tipData) {
  try {
    const docRef = await db.collection(COLLECTIONS.TIPS).add({
      ...tipData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Update creator stats
    await updateCreatorStats(tipData.creatorAddress, tipData.amount, tipData.token)

    return docRef.id
  } catch (error) {
    console.error("Error saving tip:", error)
    throw error
  }
}

export async function getTipsByAddress(tipperAddress, limit = 10) {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.TIPS)
      .where("tipperAddress", "==", tipperAddress)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }))
  } catch (error) {
    console.error("Error getting tips by address:", error)
    throw error
  }
}

export async function getTipsByCreator(creatorAddress, limit = 10) {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.TIPS)
      .where("creatorAddress", "==", creatorAddress)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }))
  } catch (error) {
    console.error("Error getting tips by creator:", error)
    throw error
  }
}

// Creator Management Functions
export async function getCreatorByHandle(handle) {
  try {
    const snapshot = await db.collection(COLLECTIONS.CREATORS).where("handle", "==", handle).limit(1).get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    }
  } catch (error) {
    console.error("Error getting creator by handle:", error)
    throw error
  }
}

export async function getTopCreators(limit = 10) {
  try {
    const snapshot = await db.collection(COLLECTIONS.CREATORS).orderBy("totalTips", "desc").limit(limit).get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting top creators:", error)
    throw error
  }
}

export async function updateCreatorStats(creatorAddress, amount, token) {
  try {
    const creatorRef = db.collection(COLLECTIONS.CREATORS).doc(creatorAddress)
    const creatorDoc = await creatorRef.get()

    if (creatorDoc.exists) {
      // Update existing creator
      await creatorRef.update({
        totalTips: admin.firestore.FieldValue.increment(amount),
        tipCount: admin.firestore.FieldValue.increment(1),
        lastTipAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    } else {
      // Create new creator record
      await creatorRef.set({
        address: creatorAddress,
        totalTips: amount,
        tipCount: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastTipAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error updating creator stats:", error)
    throw error
  }
}

// Dashboard Functions
export async function getDashboardStats(address) {
  try {
    // Get total tips received
    const tipsSnapshot = await db.collection(COLLECTIONS.TIPS).where("creatorAddress", "==", address).get()

    let totalAmount = 0
    let tipCount = 0
    const supporterMap = new Map()

    tipsSnapshot.docs.forEach((doc) => {
      const tip = doc.data()
      totalAmount += tip.amount
      tipCount += 1

      // Track supporters
      const tipperAddress = tip.tipperAddress
      if (supporterMap.has(tipperAddress)) {
        supporterMap.set(tipperAddress, {
          ...supporterMap.get(tipperAddress),
          totalAmount: supporterMap.get(tipperAddress).totalAmount + tip.amount,
          tipCount: supporterMap.get(tipperAddress).tipCount + 1,
        })
      } else {
        supporterMap.set(tipperAddress, {
          address: tipperAddress,
          handle: tip.tipperHandle || "Anonymous",
          totalAmount: tip.amount,
          tipCount: 1,
        })
      }
    })

    // Get top supporters
    const topSupporters = Array.from(supporterMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5)

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      tipCount,
      topSupporters,
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    throw error
  }
}

// User Management Functions
export async function saveUserProfile(userData) {
  try {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userData.address)
    await userRef.set(
      {
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    // Also update creator record if handle exists
    if (userData.handle) {
      const creatorRef = db.collection(COLLECTIONS.CREATORS).doc(userData.address)
      await creatorRef.set(
        {
          address: userData.address,
          handle: userData.handle,
          avatar: userData.avatar,
          fid: userData.fid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
    }

    return userData.address
  } catch (error) {
    console.error("Error saving user profile:", error)
    throw error
  }
}

export async function getUserProfile(address) {
  try {
    const doc = await db.collection(COLLECTIONS.USERS).doc(address).get()

    if (!doc.exists) {
      return null
    }

    return {
      id: doc.id,
      ...doc.data(),
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Notification Functions
export async function saveNotificationToken(tokenData) {
  try {
    const tokenRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(tokenData.address)
    await tokenRef.set(
      {
        ...tokenData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    return tokenData.address
  } catch (error) {
    console.error("Error saving notification token:", error)
    throw error
  }
}

export async function getNotificationToken(address) {
  try {
    const doc = await db.collection(COLLECTIONS.NOTIFICATIONS).doc(address).get()

    if (!doc.exists) {
      return null
    }

    return doc.data().notificationToken
  } catch (error) {
    console.error("Error getting notification token:", error)
    throw error
  }
}

export async function getNotificationsByAddress(address, limit = 20) {
  try {
    const snapshot = await db
      .collection("user_notifications")
      .where("recipientAddress", "==", address)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }))
  } catch (error) {
    console.error("Error getting notifications by address:", error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    const notificationRef = db.collection("user_notifications").doc(notificationId)
    await notificationRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export async function markAllNotificationsAsRead(address) {
  try {
    const snapshot = await db
      .collection("user_notifications")
      .where("recipientAddress", "==", address)
      .where("read", "==", false)
      .get()

    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

export async function saveNotification(notificationData) {
  try {
    const docRef = await db.collection("user_notifications").add({
      ...notificationData,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return docRef.id
  } catch (error) {
    console.error("Error saving notification:", error)
    throw error
  }
}

// Utility Functions
export async function initializeFirestore() {
  try {
    
    return true
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    throw error
  }
}

export { db, admin }
