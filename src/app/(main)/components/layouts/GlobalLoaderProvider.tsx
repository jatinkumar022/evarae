'use client';

import React, { useEffect, useRef, useState } from 'react';
import Loader from '@/app/(main)/components/layouts/Loader';

/**
 * GlobalLoaderProvider
 * - Intercepts window.fetch for selected API routes
 * - Shows fullscreen Loader while any tracked requests are in-flight
 * - Provides contextual loading messages based on the API endpoint
 */
export default function GlobalLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [inFlightCount, setInFlightCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const originalFetchRef = useRef<typeof window.fetch | null>(null);

  // Path prefixes to consider "main" API calls
  const trackedPrefixes = useRef<string[]>(['/api/']);

  // Get contextual loading message based on URL
  const getLoadingMessage = (url: string): string => {
    if (url.includes('/api/main/product')) {
      return 'Loading products...';
    }
    if (url.includes('/api/main/categories')) {
      return 'Loading categories...';
    }
    if (url.includes('/api/main/collections')) {
      return 'Loading collections...';
    }
    if (url.includes('/api/main/search')) {
      return 'Searching products...';
    }
    if (url.includes('/api/main/new-arrived')) {
      return 'Loading new arrivals...';
    }
    if (url.includes('/api/checkout')) {
      return 'Processing payment...';
    }
    if (url.includes('/api/auth')) {
      return 'Authenticating...';
    }
    if (url.includes('/api/account')) {
      return 'Updating account...';
    }
    if (url.includes('/api/orders')) {
      return 'Loading orders...';
    }
    if (url.includes('/api/wishlist')) {
      return 'Updating wishlist...';
    }
    if (url.includes('/api/admin')) {
      return 'Loading admin data...';
    }
    return 'Loading...';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Avoid double-wrapping
    if (originalFetchRef.current) return;

    originalFetchRef.current = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string' ? input : String((input as URL).toString());
      const isTracked = trackedPrefixes.current.some(prefix =>
        url.includes(prefix)
      );

      if (isTracked) {
        setInFlightCount(count => count + 1);
        setLoadingMessage(getLoadingMessage(url));
      }

      try {
        const res = await originalFetchRef.current!(input as RequestInfo, init);
        return res;
      } finally {
        if (isTracked) {
          setInFlightCount(count => Math.max(0, count - 1));
          // Reset message after a short delay to avoid flickering
          setTimeout(() => {
            setInFlightCount(current => {
              if (current === 0) {
                setLoadingMessage('Loading...');
              }
              return current;
            });
          }, 100);
        }
      }
    };

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
        originalFetchRef.current = null;
      }
    };
  }, []);
 
  return (
    <>
      {children}
      {inFlightCount > 0 && <Loader fullscreen showLogo />}
    </>
  );
}
