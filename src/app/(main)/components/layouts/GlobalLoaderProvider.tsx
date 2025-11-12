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
  const originalFetchRef = useRef<typeof window.fetch | null>(null);

  // Only treat content/data GET requests from public "main" APIs as global loader candidates
  const trackedPrefixes = useRef<string[]>(['/api/main/']);
  const excludedPrefixes = useRef<string[]>([
    '/api/main/wishlist',
    '/api/main/cart',
    '/api/account/',
    '/api/auth/',
    '/api/upload',
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Avoid double-wrapping
    if (originalFetchRef.current) return;

    originalFetchRef.current = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      const method = request.method?.toUpperCase() || 'GET';
      const skipGlobalLoader =
        request.headers.get('x-skip-global-loader') === 'true';

      if (skipGlobalLoader) {
        request.headers.delete('x-skip-global-loader');
      }

      const url = request.url;
      const isTrackedRequest =
        method === 'GET' &&
        trackedPrefixes.current.some(prefix => url.includes(prefix)) &&
        !excludedPrefixes.current.some(prefix => url.includes(prefix)) &&
        !skipGlobalLoader;

      if (isTrackedRequest) {
        setInFlightCount(count => count + 1);
      }

      try {
        const res = await originalFetchRef.current!(request);
        return res;
      } finally {
        if (isTrackedRequest) {
          setInFlightCount(count => Math.max(0, count - 1));
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

  // Prevent body scrolling when global loader is active
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLoaderActive = 
      inFlightCount > 0 && 
      !window.location.pathname.startsWith('/admin');

    if (isLoaderActive) {
      // Save original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original overflow style on cleanup
        document.body.style.overflow = originalStyle;
      };
    }
  }, [inFlightCount]);

  return (
    <>
      {children}
      {/* Do not show fullscreen global loader on admin routes. Admin pages will handle inline/content loaders themselves. */}
      {typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/admin') &&
        inFlightCount > 0 && <Loader fullscreen showLogo />}
    </>
  );
}
