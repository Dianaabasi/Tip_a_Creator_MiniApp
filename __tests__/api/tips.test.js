import handler from "../../pages/api/tips"
import { createMocks } from "node-mocks-http"
import jest from "jest"

// Mock Firebase Admin
jest.mock("../../lib/firebaseAdmin", () => ({
  saveTip: jest.fn(),
  getTipsByAddress: jest.fn(),
  getTipsByCreator: jest.fn(),
}))

// Mock OnchainKit
jest.mock("@coinbase/onchainkit", () => ({
  verifySignInMessage: jest.fn(),
}))

describe("/api/tips", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST /api/tips", () => {
    it("should create a tip successfully", async () => {
      const { saveTip } = require("../../lib/firebaseAdmin")
      const { verifySignInMessage } = require("@coinbase/onchainkit")

      saveTip.mockResolvedValue("tip-id-123")
      verifySignInMessage.mockResolvedValue(true)

      const { req, res } = createMocks({
        method: "POST",
        body: {
          creatorHandle: "alice",
          creatorAddress: "0x1234567890123456789012345678901234567890",
          amount: 10,
          token: "USDC",
          txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          message: "Great content!",
          auth: {
            message: "Sign in to Tip-a-Creator",
            signature: "0xsignature",
            address: "0x9876543210987654321098765432109876543210",
          },
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      const data = JSON.parse(res._getData())
      expect(data.success).toBe(true)
      expect(data.tipId).toBe("tip-id-123")
      expect(saveTip).toHaveBeenCalledWith(
        expect.objectContaining({
          tipperAddress: "0x9876543210987654321098765432109876543210",
          creatorAddress: "0x1234567890123456789012345678901234567890",
          amount: 10,
          token: "USDC",
          message: "Great content!",
        }),
      )
    })

    it("should reject invalid authentication", async () => {
      const { verifySignInMessage } = require("@coinbase/onchainkit")
      verifySignInMessage.mockResolvedValue(false)

      const { req, res } = createMocks({
        method: "POST",
        body: {
          creatorHandle: "alice",
          creatorAddress: "0x1234567890123456789012345678901234567890",
          amount: 10,
          token: "USDC",
          txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          auth: {
            message: "Invalid message",
            signature: "0xinvalid",
            address: "0x9876543210987654321098765432109876543210",
          },
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(401)
      const data = JSON.parse(res._getData())
      expect(data.error).toBe("Invalid authentication")
    })

    it("should reject missing required fields", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          creatorHandle: "alice",
          // Missing required fields
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      const data = JSON.parse(res._getData())
      expect(data.error).toBe("Missing required fields")
    })

    it("should reject invalid transaction hash", async () => {
      const { verifySignInMessage } = require("@coinbase/onchainkit")
      verifySignInMessage.mockResolvedValue(true)

      const { req, res } = createMocks({
        method: "POST",
        body: {
          creatorHandle: "alice",
          creatorAddress: "0x1234567890123456789012345678901234567890",
          amount: 10,
          token: "USDC",
          txHash: "invalid-hash",
          auth: {
            message: "Sign in to Tip-a-Creator",
            signature: "0xsignature",
            address: "0x9876543210987654321098765432109876543210",
          },
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      const data = JSON.parse(res._getData())
      expect(data.error).toBe("Invalid transaction hash")
    })
  })

  describe("GET /api/tips", () => {
    it("should get tips by tipper address", async () => {
      const { getTipsByAddress } = require("../../lib/firebaseAdmin")
      const mockTips = [
        {
          id: "tip-1",
          amount: 10,
          token: "USDC",
          creatorHandle: "alice",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ]
      getTipsByAddress.mockResolvedValue(mockTips)

      const { req, res } = createMocks({
        method: "GET",
        query: {
          tipperAddress: "0x9876543210987654321098765432109876543210",
          limit: "10",
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.tips).toEqual(mockTips)
      expect(getTipsByAddress).toHaveBeenCalledWith("0x9876543210987654321098765432109876543210", 10)
    })

    it("should require address parameter", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {},
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      const data = JSON.parse(res._getData())
      expect(data.error).toBe("Address parameter required")
    })
  })

  it("should reject unsupported methods", async () => {
    const { req, res } = createMocks({
      method: "DELETE",
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe("Method not allowed")
  })
})
