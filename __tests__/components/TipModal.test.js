"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import TipModal from "../../components/TipModal"
import jest from "jest" // Import jest to declare it

// Mock OnchainKit
jest.mock("@coinbase/onchainkit", () => ({
  useAuthenticate: () => ({
    user: {
      address: "0x1234567890123456789012345678901234567890",
    },
  }),
  useWallet: () => ({
    address: "0x1234567890123456789012345678901234567890",
  }),
  composeCast: jest.fn(),
}))

// Mock Toast
jest.mock("../../components/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe("TipModal", () => {
  const mockCreator = {
    handle: "alice",
    address: "0x9876543210987654321098765432109876543210",
    avatar: "https://example.com/avatar.jpg",
  }

  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    fetch.mockClear()
  })

  it("renders tip modal with creator info", () => {
    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    expect(screen.getByText("Tip @alice")).toBeInTheDocument()
    expect(screen.getByText("Amount")).toBeInTheDocument()
    expect(screen.getByText("$1")).toBeInTheDocument()
    expect(screen.getByText("$5")).toBeInTheDocument()
    expect(screen.getByText("$10")).toBeInTheDocument()
    expect(screen.getByText("$25")).toBeInTheDocument()
  })

  it("allows selecting preset amounts", () => {
    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    const fiveDollarButton = screen.getByText("$5")
    fireEvent.click(fiveDollarButton)

    const customInput = screen.getByPlaceholderText("Custom amount")
    expect(customInput.value).toBe("5")
  })

  it("allows entering custom amount", () => {
    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    const customInput = screen.getByPlaceholderText("Custom amount")
    fireEvent.change(customInput, { target: { value: "15" } })

    expect(customInput.value).toBe("15")
  })

  it("allows entering optional message", () => {
    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    const messageInput = screen.getByPlaceholderText("Add a message with your tip...")
    fireEvent.change(messageInput, { target: { value: "Great work!" } })

    expect(messageInput.value).toBe("Great work!")
  })

  it("shows character count for message", () => {
    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    const messageInput = screen.getByPlaceholderText("Add a message with your tip...")
    fireEvent.change(messageInput, { target: { value: "Hello" } })

    expect(screen.getByText("5/200")).toBeInTheDocument()
  })

  it("disables confirm button when no amount is entered", () => {
    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    const confirmButton = screen.getByRole("button", { name: /tip/i })
    expect(confirmButton).toBeDisabled()
  })

  it("enables confirm button when amount is entered", () => {
    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    const customInput = screen.getByPlaceholderText("Custom amount")
    fireEvent.change(customInput, { target: { value: "10" } })

    const confirmButton = screen.getByRole("button", { name: /tip 10 usdc/i })
    expect(confirmButton).not.toBeDisabled()
  })

  it("processes tip successfully", async () => {
    const { composeCast } = require("@coinbase/onchainkit")

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tipId: "tip-123" }),
    })

    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    // Enter amount
    const customInput = screen.getByPlaceholderText("Custom amount")
    fireEvent.change(customInput, { target: { value: "10" } })

    // Enter message
    const messageInput = screen.getByPlaceholderText("Add a message with your tip...")
    fireEvent.change(messageInput, { target: { value: "Great content!" } })

    // Click confirm
    const confirmButton = screen.getByRole("button", { name: /tip 10 usdc/i })
    fireEvent.click(confirmButton)

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText("Tip Sent Successfully!")).toBeInTheDocument()
    })

    // Verify API call
    expect(fetch).toHaveBeenCalledWith("/api/tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creatorHandle: "alice",
        creatorAddress: "0x9876543210987654321098765432109876543210",
        amount: 10,
        token: "USDC",
        txHash: expect.any(String),
        message: "Great content!",
        auth: expect.any(Object),
      }),
    })

    // Verify cast composition
    expect(composeCast).toHaveBeenCalledWith({
      text: 'Just tipped 10 USDC to @alice 🎉: "Great content!"',
      embeds: [`${process.env.NEXT_PUBLIC_APP_URL}/profile/alice`],
    })
  })

  it("closes modal when close button is clicked", () => {
    render(<TipModal creator={mockCreator} onClose={mockOnClose} />)

    const closeButton = screen.getByText("✕")
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
