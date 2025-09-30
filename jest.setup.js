import jest from "jest"
import "@testing-library/jest-dom"

// Mock Firebase
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      add: jest.fn(),
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      })),
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  })),
}))

// Mock OnchainKit
jest.mock("@coinbase/onchainkit", () => ({
  useAuthenticate: jest.fn(),
  useWallet: jest.fn(),
  useMiniKit: jest.fn(),
  composeCast: jest.fn(),
}))

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: "/",
    query: {},
  }),
}))
