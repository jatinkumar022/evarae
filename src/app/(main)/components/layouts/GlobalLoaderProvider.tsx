'use client';

import React, { useEffect, useRef, useState } from 'react';
import Loader from '@/app/(main)/components/layouts/Loader';
import { useNavigationStore } from '@/lib/data/mainStore/navigationStore';
import { usePathname } from 'next/navigation';

/**
 * GlobalLoaderProvider (Navigation Loader Only)
 * - Shows fullscreen Loader during navigation (when Link is clicked or route changes)
 * - Loader stays active until the new page is fully loaded and pathname changes
 * - Does NOT intercept API calls - each page handles its own loading states
 */
export default function GlobalLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isNavigating, setNavigating } = useNavigationStore();
  const pathname = usePathname();
  const pathnameRef = useRef<string | null>(null);
  const navigationStartTimeRef = useRef<number | null>(null);
  const navigationStartPathRef = useRef<string | null>(null);
  const minLoaderTimeRef = useRef(300); // Minimum 300ms loader display to prevent flickering
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Track mount state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track initial load - mark as complete after a short delay
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialLoad) {
      const timer = setTimeout(() => {
          setIsInitialLoad(false);
      }, 500); // Short delay for initial page load
      
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  // Track pathname changes to detect navigation completion
  useEffect(() => {
    if (pathnameRef.current !== null && pathnameRef.current !== pathname) {
      // Pathname changed - navigation occurred
      pathnameRef.current = pathname;
      // Mark initial load as complete on first navigation
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } else if (pathnameRef.current === null) {
      // Initial load
      pathnameRef.current = pathname;
    }
  }, [isInitialLoad, pathname]);

  // Clear navigation state when navigation completes:
  // 1. Pathname changed from when navigation started
  // 2. Minimum loader display time has elapsed
  useEffect(() => {
    if (navigationStartTimeRef.current === null) return;

    const elapsed = Date.now() - navigationStartTimeRef.current;
    const remainingTime = Math.max(minLoaderTimeRef.current - elapsed, 0);
    const hasPathChanged =
      navigationStartPathRef.current !== null &&
      pathnameRef.current !== null &&
      pathnameRef.current !== navigationStartPathRef.current;

      // Fallback: ensure loader doesn't get stuck if navigation was cancelled
    if (!hasPathChanged && elapsed > 10000) {
      setNavigating(false);
      navigationStartTimeRef.current = null;
      navigationStartPathRef.current = null;
      return;
    }

    // Complete navigation when pathname has changed
    if (hasPathChanged) {
      const completeNavigation = () => {
        setNavigating(false);
        navigationStartTimeRef.current = null;
        navigationStartPathRef.current = null;
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      };

      if (remainingTime <= 0) {
        completeNavigation();
      } else {
        const timer = setTimeout(completeNavigation, remainingTime);
        return () => clearTimeout(timer);
      }
    }
  }, [isInitialLoad, pathname, setNavigating]);

  // Intercept all Link clicks globally to show loader immediately
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link) return;

      // Skip if interaction is happening through an embedded button or control inside the link.
      const interactiveElement = target.closest(
        'button, [role="button"], input, select, textarea, label'
      );
      if (interactiveElement && link.contains(interactiveElement)) {
        return;
      }

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
        // Use setTimeout to defer state update and avoid useInsertionEffect error
        setTimeout(() => setNavigating(true), 0);
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
        // Use setTimeout to defer state update and avoid useInsertionEffect error
        setTimeout(() => setNavigating(true), 0);
      }
      return originalPush.apply(window.history, args);
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.history.pushState = originalPush;
    };
  }, [pathname, setNavigating]);

  // Prevent body scrolling when navigation loader is active
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLoaderActive = 
      (isInitialLoad || isNavigating) && 
      !window.location.pathname.startsWith('/admin');

    if (isLoaderActive) {
      // Save original styles
      const originalBodyOverflow = window.getComputedStyle(document.body).overflow;
      const originalHtmlOverflow = window.getComputedStyle(document.documentElement).overflow;
      const originalBodyHeight = document.body.style.height;
      
      // Disable scrolling on both body and html (Safari fix)
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      return () => {
        // Restore original styles on cleanup
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.height = originalBodyHeight;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isNavigating, isInitialLoad]);

  // Show loader if:
  // 1. Initial load is in progress
  // 2. Navigating between pages
  // Only calculate shouldShowLoader after mount to prevent hydration mismatch
  const shouldShowLoader = 
    mounted &&
    typeof window !== 'undefined' &&
    !window.location.pathname.startsWith('/admin') &&
    (isInitialLoad || isNavigating);

  return (
    <>
      {children}
      {/* Navigation loader - shows during route changes only */}
      {shouldShowLoader && <Loader fullscreen showLogo />}
    </>
  );
}
