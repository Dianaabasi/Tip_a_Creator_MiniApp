import { generateFrameMetaTags, validateFrameSignature, extractFrameData } from "../../lib/frame-utils"

describe("frame-utils", () => {
  describe("generateFrameMetaTags", () => {
    it("generates basic frame meta tags", () => {
      const metaTags = generateFrameMetaTags({
        title: "Test Frame",
        description: "Test Description",
        image: "https://example.com/image.jpg",
      })

      expect(metaTags).toEqual({
        "fc:frame": "vNext",
        "fc:frame:image": "https://example.com/image.jpg",
        "og:title": "Test Frame",
        "og:description": "Test Description",
        "og:image": "https://example.com/image.jpg",
      })
    })

    it("generates frame meta tags with buttons", () => {
      const metaTags = generateFrameMetaTags({
        title: "Test Frame",
        buttons: [
          { text: "Button 1", action: "post" },
          { text: "Button 2", action: "link", target: "https://example.com" },
        ],
      })

      expect(metaTags["fc:frame:button:1"]).toBe("Button 1")
      expect(metaTags["fc:frame:button:1:action"]).toBe("post")
      expect(metaTags["fc:frame:button:2"]).toBe("Button 2")
      expect(metaTags["fc:frame:button:2:action"]).toBe("link")
      expect(metaTags["fc:frame:button:2:target"]).toBe("https://example.com")
    })

    it("generates frame meta tags with post URL", () => {
      const metaTags = generateFrameMetaTags({
        postUrl: "https://example.com/api/frame/action",
      })

      expect(metaTags["fc:frame:post_url"]).toBe("https://example.com/api/frame/action")
    })

    it("generates frame meta tags with input text", () => {
      const metaTags = generateFrameMetaTags({
        inputText: "Enter creator handle",
      })

      expect(metaTags["fc:frame:input:text"]).toBe("Enter creator handle")
    })

    it("uses default values when options are not provided", () => {
      const metaTags = generateFrameMetaTags()

      expect(metaTags["og:title"]).toBe("Tip-a-Creator")
      expect(metaTags["og:description"]).toBe("Support creators with USDC tips")
      expect(metaTags["fc:frame:image"]).toContain("/frame-image.jpg")
    })
  })

  describe("extractFrameData", () => {
    it("extracts frame data from request", () => {
      const request = {
        body: {
          untrustedData: {
            fid: 12345,
            buttonIndex: 1,
            inputText: "alice",
            castId: { hash: "0xabcdef" },
            timestamp: 1640995200,
            network: 1,
          },
          trustedData: {
            messageBytes: "0x...",
          },
        },
      }

      const frameData = extractFrameData(request)

      expect(frameData).toEqual({
        fid: 12345,
        buttonIndex: 1,
        inputText: "alice",
        castHash: "0xabcdef",
        timestamp: 1640995200,
        network: 1,
      })
    })

    it("handles missing data gracefully", () => {
      const request = { body: {} }
      const frameData = extractFrameData(request)

      expect(frameData).toEqual({
        fid: undefined,
        buttonIndex: undefined,
        inputText: undefined,
        castHash: undefined,
        timestamp: undefined,
        network: undefined,
      })
    })
  })

  describe("validateFrameSignature", () => {
    it("returns true for valid signature (simplified)", () => {
      const result = validateFrameSignature("body", "signature")
      expect(result).toBe(true)
    })
  })
})
