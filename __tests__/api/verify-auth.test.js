import handler from "../../pages/api/verify-auth"
import { createMocks } from "node-mocks-http"
import jest from "jest"

// Mock OnchainKit
jest.mock("@coinbase/onchainkit", () => ({
  verifySignInMessage: jest.fn(),
}))

describe("/api/verify-auth", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should verify valid authentication", async () => {
    const { verifySignInMessage } = require("@coinbase/onchainkit")
    verifySignInMessage.mockResolvedValue(true)

    const { req, res } = createMocks({
      method: "POST",
      body: {
        message: "Sign in to Tip-a-Creator at 2024-01-01T00:00:00Z",
        signature: "0xvalidsignature",
        address: "0x1234567890123456789012345678901234567890",
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.address).toBe("0x1234567890123456789012345678901234567890")
    expect(verifySignInMessage).toHaveBeenCalledWith({
      message: "Sign in to Tip-a-Creator at 2024-01-01T00:00:00Z",
      signature: "0xvalidsignature",
      address: "0x1234567890123456789012345678901234567890",
    })
  })

  it("should reject invalid signature", async () => {
    const { verifySignInMessage } = require("@coinbase/onchainkit")
    verifySignInMessage.mockResolvedValue(false)

    const { req, res } = createMocks({
      method: "POST",
      body: {
        message: "Sign in to Tip-a-Creator",
        signature: "0xinvalidsignature",
        address: "0x1234567890123456789012345678901234567890",
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe("Invalid signature")
  })

  it("should reject missing fields", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        message: "Sign in to Tip-a-Creator",
        // Missing signature and address
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe("Missing required fields")
  })

  it("should reject non-POST methods", async () => {
    const { req, res } = createMocks({
      method: "GET",
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe("Method not allowed")
  })
})
