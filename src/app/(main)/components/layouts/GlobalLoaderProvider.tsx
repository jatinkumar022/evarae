'use client';

import React, { useEffect, useRef, useState } from 'react';
import Loader from '@/app/(main)/components/layouts/Loader';
import { useNavigationStore } from '@/lib/data/mainStore/navigationStore';
import { usePathname } from 'next/navigation';

/**
 * GlobalLoaderProvider
 * - Intercepts window.fetch for selected API routes
 * - Shows fullscreen Loader while any tracked requests are in-flight
 * - Shows loader immediately on navigation
 * - Provides contextual loading messages based on the API endpoint
 */
export default function GlobalLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [inFlightCount, setInFlightCount] = useState(0);
  const { isNavigating, setNavigating } = useNavigationStore();
  const pathname = usePathname();
  const originalFetchRef = useRef<typeof window.fetch | null>(null);
  const pathnameRef = useRef<string | null>(null);
  const navigationStartTimeRef = useRef<number | null>(null);
  const navigationStartPathRef = useRef<string | null>(null);
  const minLoaderTimeRef = useRef(300); // Minimum 300ms loader display to prevent flickering
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initialLoadStartTimeRef = useRef<number | null>(null);
  const hasSeenApiCallRef = useRef(false); // Track if we've seen any API calls
  
  // Track initial load - run only once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialLoadStartTimeRef.current = Date.now();
      // Set a timeout to mark initial load as complete if no API calls happen
      // This handles cases where page doesn't make API calls
      const fallbackTimer = setTimeout(() => {
        if (!hasSeenApiCallRef.current) {
          setIsInitialLoad(false);
        }
      }, 2000); // 2 second fallback - only if no API calls at all
      
      return () => clearTimeout(fallbackTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Track pathname changes to detect navigation completion
  useEffect(() => {
    if (pathnameRef.current !== null && pathnameRef.current !== pathname) {
      // Pathname changed - navigation occurred
      pathnameRef.current = pathname;
      // Mark initial load as complete on first navigation
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
      // Don't clear navigation state here - wait for API calls to complete
    } else if (pathnameRef.current === null) {
      // Initial load
      pathnameRef.current = pathname;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle initial load completion
  // Only complete initial load when:
  // 1. We've seen at least one API call (or waited for fallback timeout)
  // 2. All API calls are complete
  // 3. Minimum display time has passed
  useEffect(() => {
    if (!isInitialLoad) return; // Early return if already completed
    
    // Wait for API calls to complete
    if (inFlightCount === 0 && initialLoadStartTimeRef.current !== null) {
      // Only complete if we've seen API calls, or if enough time has passed
      const elapsed = Date.now() - initialLoadStartTimeRef.current;
      const hasWaitedEnough = elapsed >= 500; // Wait at least 500ms
      
      if (hasSeenApiCallRef.current || hasWaitedEnough) {
        const remainingTime = Math.max(0, minLoaderTimeRef.current - elapsed);
        
        const timer = setTimeout(() => {
          setIsInitialLoad(false);
          initialLoadStartTimeRef.current = null;
          hasSeenApiCallRef.current = false; // Reset for next page load
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isInitialLoad, inFlightCount]);

  // Clear navigation state only when:
  // 1. Navigation started (isNavigating = true)
  // 2. Pathname has changed from when navigation started (navigation completed)
  // 3. All API calls are complete (inFlightCount === 0)
  // 4. Minimum display time has passed
  useEffect(() => {
    if (!isNavigating) return; // Early return if not navigating
    
    // Only clear if navigation started, API calls are done, and pathname has changed
    if (inFlightCount === 0) {
      // Check if pathname has actually changed from when navigation started
      const hasNavigated = navigationStartPathRef.current !== null && 
                          pathname !== navigationStartPathRef.current;
      
      if (hasNavigated) {
        const elapsed = navigationStartTimeRef.current 
          ? Date.now() - navigationStartTimeRef.current 
          : 0;
        const remainingTime = Math.max(0, minLoaderTimeRef.current - elapsed);
        
        const timer = setTimeout(() => {
          setNavigating(false);
          navigationStartTimeRef.current = null;
          navigationStartPathRef.current = null;
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating, inFlightCount, pathname]);

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
        hasSeenApiCallRef.current = true; // Mark that we've seen an API call
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

  // Intercept all Link clicks globally to show loader immediately
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Skip if it's an anchor link, external link, or has special modifiers
      if (
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        link.target === '_blank' ||
        link.hasAttribute('data-skip-loader')
      ) {
        return;
      }

      // Only intercept internal Next.js links
      if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
        // Show loader immediately and track navigation start time and path
        navigationStartTimeRef.current = Date.now();
        navigationStartPathRef.current = pathnameRef.current || pathname;
        setNavigating(true);
      }
    };

    // Intercept router.push calls by wrapping Next.js router
    const originalPush = window.history.pushState;
    window.history.pushState = function(...args) {
      // Check if it's a navigation (not just state change)
      const url = args[2];
      if (url && typeof url === 'string' && url.startsWith('/')) {
        navigationStartTimeRef.current = Date.now();
        navigationStartPathRef.current = pathnameRef.current || pathname;
        setNavigating(true);
      }
      return originalPush.apply(window.history, args);
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.history.pushState = originalPush;
    };
  }, [setNavigating]);

  // Prevent body scrolling when global loader is active
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLoaderActive = 
      (isInitialLoad || isNavigating || inFlightCount > 0) && 
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
  }, [inFlightCount, isNavigating, isInitialLoad]);

  // Show loader if:
  // 1. Initial load is in progress
  // 2. Navigating between pages
  // 3. API calls are in flight
  const shouldShowLoader = 
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/admin') &&
    (isInitialLoad || isNavigating || inFlightCount > 0);

  return (
    <>
      {children}
      {/* Do not show fullscreen global loader on admin routes. Admin pages will handle inline/content loaders themselves. */}
      {shouldShowLoader && <Loader fullscreen showLogo />}
    </>
  );
}
