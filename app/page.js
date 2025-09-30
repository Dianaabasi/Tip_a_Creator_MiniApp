'use client';

import { useState, useEffect } from 'react';
import { useAuthenticate, useMiniKit } from '@coinbase/onchainkit/minikit';
import Link from 'next/link';
import Image from 'next/image';
import TipButton from '../components/TipButton';
import { useToast, ToastProvider } from '../components/Toast';
import { FrameProvider } from '../components/FrameProvider';
import FrameLayout from '../components/FrameLayout';

export default function Page() {
  return (
    <FrameProvider>
      <ToastProvider>
        <FrameLayout>
          <PageContent />
        </FrameLayout>
      </ToastProvider>
    </FrameProvider>
  );
}

function PageContent() {
  const [topCreators, setTopCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthenticate();
  const { isFrameContext, setFrameReady, isFrameReady } = useMiniKit();
  const { showToast } = useToast();

  // Fetch creators only once on mount
  useEffect(() => {
    fetchTopCreators();
  }, []); // Empty dependency array to run once

  // Handle MiniKit frame ready state
  useEffect(() => {
    console.log('MiniKit status:', { isFrameContext, isFrameReady });
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const fetchTopCreators = async () => {
    try {
      const response = await fetch('/api/creators/top');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTopCreators(data.creators || []);
    } catch (error) {
      console.error('Error fetching top creators:', error);
      showToast('Failed to load creators', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="frame-content">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="frame-content">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tip-a-Creator</h1>
        <p className="text-gray-600">Support your favorite creators with USDC tips</p>
      </div>

      {!isAuthenticated && (
        <div className="card mb-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-4">Connect your wallet to start tipping creators</p>
          <button className="btn-primary">Connect Wallet</button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Creators to Tip</h2>

        {topCreators.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-600">No creators found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topCreators.map((creator) => (
              <CreatorCard key={creator.handle || creator.id} creator={creator} />
            ))}
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="card">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="flex gap-2">
            <Link href="/history" className="btn-secondary text-sm">
              My Tips
            </Link>
            <Link href="/dashboard" className="btn-secondary text-sm">
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CreatorCard({ creator }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            {creator.avatar ? (
              <Image
                src={creator.avatar || '/placeholder.svg'}
                alt={creator.handle}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <span className="text-lg font-semibold text-gray-600">{creator.handle.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <Link href={`/profile/${creator.handle}`}>
              <h3 className="font-semibold hover:text-primary-600 cursor-pointer">@{creator.handle}</h3>
            </Link>
            <p className="text-sm text-gray-600">${creator.totalTips || 0} received</p>
          </div>
        </div>
        <TipButton creator={creator} size="sm" />
      </div>
    </div>
  );
}