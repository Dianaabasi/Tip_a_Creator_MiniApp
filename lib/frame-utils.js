// Utility functions for frame handling
export function generateFrameMetaTags(options = {}) {
  const {
    title = "Tip-a-Creator",
    description = "Support creators with USDC tips",
    image,
    buttons = [],
    postUrl,
    inputText,
  } = options

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const defaultImage = `${baseUrl}/frame-image.jpg`

  const metaTags = {
    "fc:frame": "vNext",
    "fc:frame:image": image || defaultImage,
    "og:title": title,
    "og:description": description,
    "og:image": image || defaultImage,
  }

  // Add buttons
  buttons.forEach((button, index) => {
    const buttonNum = index + 1
    metaTags[`fc:frame:button:${buttonNum}`] = button.text

    if (button.action) {
      metaTags[`fc:frame:button:${buttonNum}:action`] = button.action
    }

    if (button.target) {
      metaTags[`fc:frame:button:${buttonNum}:target`] = button.target
    }
  })

  // Add post URL
  if (postUrl) {
    metaTags["fc:frame:post_url"] = postUrl
  }

  // Add input text
  if (inputText) {
    metaTags["fc:frame:input:text"] = inputText
  }

  return metaTags
}

export function validateFrameSignature(body, signature) {
  // Implement frame signature validation
  // This would typically use the Farcaster Hub API
  return true // Simplified for demo
}

export function extractFrameData(request) {
  const { untrustedData, trustedData } = request.body || {}

  return {
    fid: untrustedData?.fid,
    buttonIndex: untrustedData?.buttonIndex,
    inputText: untrustedData?.inputText,
    castHash: untrustedData?.castId?.hash,
    timestamp: untrustedData?.timestamp,
    network: untrustedData?.network,
    // Add more fields as needed
  }
}

export function createFrameResponse(options = {}) {
  const { image, buttons = [], inputText, postUrl, redirectUrl } = options

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  const response = {
    type: "frame",
    frameUrl: redirectUrl || baseUrl,
  }

  if (image || buttons.length > 0 || inputText || postUrl) {
    response.frame = generateFrameMetaTags({
      image,
      buttons,
      inputText,
      postUrl,
    })
  }

  return response
}
