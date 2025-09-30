'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

export default function OnchainKitProviderWrapper({ children }) {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;

  if (!apiKey) {
    console.warn('OnchainKitProvider: Missing or invalid API key in .env.local');
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
        <p className="text-gray-600 mb-4">
          Please set a valid <code>NEXT_PUBLIC_ONCHAINKIT_API_KEY</code> in <code>.env.local</code>.
        </p>
        <p className="text-sm text-gray-500">
          Example: <code>NEXT_PUBLIC_ONCHAINKIT_API_KEY=your-api-key-here</code>
        </p>
      </div>
    );
  }

  return (
    <OnchainKitProvider
      chain={base}
      apiKey={apiKey}
      analytics={false}
      miniKit={{
        enabled: true,
        autoConnect: true,
        theme: 'light',
        mode: 'minikit',
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}