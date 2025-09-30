import Head from "next/head"
import { generateFrameMetaTags } from "../lib/frame-utils"

export default function FrameHead({ title, description, image, buttons, postUrl, inputText }) {
  const metaTags = generateFrameMetaTags({
    title,
    description,
    image,
    buttons,
    postUrl,
    inputText,
  })

  return (
    <Head>
      <title>{title || "Tip-a-Creator"}</title>
      <meta name="description" content={description || "Support creators with USDC tips"} />

      {/* Frame meta tags */}
      {Object.entries(metaTags).map(([property, content]) => (
        <meta key={property} property={property} content={content} />
      ))}

      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/icon.jpg" />
    </Head>
  )
}
