'use client';

import React, { useEffect, useRef, useState } from 'react';
import Loader from '@/app/(main)/components/layouts/Loader';

/**
 * GlobalLoaderProvider
 * - Intercepts window.fetch for selected API routes
 * - Shows fullscreen Loader ONLY for GET requests
 * - Non-GET requests (POST, PUT, DELETE, etc.) should use inline loaders in components
 */
export default function GlobalLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [inFlightCount, setInFlightCount] = useState(0);
  const originalFetchRef = useRef<typeof window.fetch | null>(null);

  // Path prefixes to consider "main" API calls
  const trackedPrefixes = useRef<string[]>(['/api/']);


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

      // Only track GET requests for fullscreen loader
      // Non-GET requests should use inline loaders in components
      const method = init?.method || 'GET';
      const isGetRequest = method.toUpperCase() === 'GET';

      if (isTracked && isGetRequest) {
        setInFlightCount(count => count + 1);
      }

      try {
        const res = await originalFetchRef.current!(input as RequestInfo, init);
        return res;
      } finally {
        if (isTracked && isGetRequest) {
          setInFlightCount(count => Math.max(0, count - 1));
          // Reset message after a short delay to avoid flickering
          setTimeout(() => {
            setInFlightCount(current => { 
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
      {/* Do not show fullscreen global loader on admin routes. Admin pages will handle inline/content loaders themselves. */}
      {/* Only show fullscreen loader for GET requests */}
      {typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/admin') &&
        inFlightCount > 0 && <Loader fullscreen showLogo />}
    </>
  );
}
