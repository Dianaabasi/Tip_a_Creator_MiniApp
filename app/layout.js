import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import OnchainKitProviderWrapper from "../components/OnchainKitProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import { FrameProvider } from "../components/FrameProvider";
import { ToastProvider } from "../components/Toast";
import FrameLayout from "../components/FrameLayout";
import "./globals.css";

export const metadata = {
  title: "Tip-a-Creator",
  description: "Support creators with USDC tips on Base",
  generator: "Next.js",
  
  openGraph: {
    images: "/tip.png", // Upload a 1200x630  PNG preview image to your public folder or CDNs
  },
  other: {
    // Basic frame metadata
    "fc:frame": "vNext",
    "fc:frame:image": "/splash.jpg", // Your app's preview (e.g., logo with "Tip a Creator")
    "fc:frame:button:1": "Open Tip a Creator",
    "fc:frame:button:1:action": "post", // Or "link" to redirect
    "fc:frame:post_url": "https://tip-a-creator.vercel.app", // Your app's URL
    // Mini app specific (optional for better integration)
    "fc:miniapp:domain": "tip-a-creator.vercel.app", // Your domain (without https://)
    "fc:miniapp:name": "Tip a Creator",
    "fc:miniapp:icon": "/tip.ICO", // 512x512 app icon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>
        <ErrorBoundary>
          <OnchainKitProviderWrapper>
            <FrameProvider>
              <ToastProvider>
                <FrameLayout>
                  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
                </FrameLayout>
              </ToastProvider>
            </FrameProvider>
          </OnchainKitProviderWrapper>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}