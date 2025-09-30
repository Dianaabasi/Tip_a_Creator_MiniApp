"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import TipButton from "../../components/TipButton"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock OnchainKit
jest.mock("@coinbase/onchainkit", () => ({
  useAuthenticate: () => ({
    isAuthenticated: true,
  }),
}))

// Mock Toast
jest.mock("../../components/Toast", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}))

// Mock TipModal
jest.mock("../../components/TipModal", () => {
  return function MockTipModal({ creator, onClose }) {
    return (
      <div data-testid="tip-modal">
        <p>Tip Modal for {creator.handle}</p>
        <button onClick={onClose}>Close Modal</button>
      </div>
    )
  }
})

describe("TipButton", () => {
  const mockCreator = {
    handle: "alice",
    address: "0x1234567890123456789012345678901234567890",
  }

  it("renders tip button", () => {
    render(<TipButton creator={mockCreator} />)

    const button = screen.getByRole("button", { name: /tip/i })
    expect(button).toBeInTheDocument()
  })

  it("opens tip modal when clicked", () => {
    render(<TipButton creator={mockCreator} />)

    const button = screen.getByRole("button", { name: /tip/i })
    fireEvent.click(button)

    expect(screen.getByTestId("tip-modal")).toBeInTheDocument()
    expect(screen.getByText("Tip Modal for alice")).toBeInTheDocument()
  })

  it("closes tip modal when close is called", () => {
    render(<TipButton creator={mockCreator} />)

    // Open modal
    const button = screen.getByRole("button", { name: /tip/i })
    fireEvent.click(button)

    // Close modal
    const closeButton = screen.getByText("Close Modal")
    fireEvent.click(closeButton)

    expect(screen.queryByTestId("tip-modal")).not.toBeInTheDocument()
  })

  it("applies different sizes correctly", () => {
    const { rerender } = render(<TipButton creator={mockCreator} size="sm" />)
    let button = screen.getByRole("button", { name: /tip/i })
    expect(button).toHaveClass("px-3", "py-1.5", "text-sm")

    rerender(<TipButton creator={mockCreator} size="lg" />)
    button = screen.getByRole("button", { name: /tip/i })
    expect(button).toHaveClass("px-6", "py-3", "text-lg")
  })

  it("can be disabled", () => {
    render(<TipButton creator={mockCreator} disabled={true} />)

    const button = screen.getByRole("button", { name: /tip/i })
    expect(button).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<TipButton creator={mockCreator} className="custom-class" />)

    const button = screen.getByRole("button", { name: /tip/i })
    expect(button).toHaveClass("custom-class")
  })
})
