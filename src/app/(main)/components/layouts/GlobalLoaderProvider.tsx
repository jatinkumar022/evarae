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

    // Safety: Ensure scroll is unlocked on mount (will be locked again if needed by other effects)
    if (typeof window !== 'undefined') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Check current state to decide if we should unlock
        // This will be overridden by the main scroll lock effect if loader is active
        const bodyOverflow = window.getComputedStyle(document.body).overflow;
        if (bodyOverflow === 'hidden') {
          // Only unlock if page is already loaded
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.overflow = '';
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  // Track initial load - mark as complete when page is ready
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialLoad) return;

    let timer: NodeJS.Timeout;
    let isComplete = false;

    const completeInitialLoad = () => {
      if (!isComplete) {
        isComplete = true;
        setIsInitialLoad(false);
        // Force unlock scroll immediately
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
      }
    };

    // Check if page is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Page is already loaded, complete immediately
      completeInitialLoad();
    } else {
      // Wait for DOMContentLoaded first (faster than load event)
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', completeInitialLoad, { once: true });
      }

      // Also wait for load event as backup
      window.addEventListener('load', completeInitialLoad, { once: true });

      // Aggressive fallback: complete after max 500ms to prevent stuck scroll
      timer = setTimeout(completeInitialLoad, 500);
    }

    return () => {
      clearTimeout(timer);
      document.removeEventListener('DOMContentLoaded', completeInitialLoad);
      window.removeEventListener('load', completeInitialLoad);
    };
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
        // Normalize the href to compare with current pathname
        const normalizedHref = href.split('?')[0].split('#')[0]; // Remove query and hash
        const currentPath = pathnameRef.current || pathname;

        // Skip if navigating to the same path (prevents infinite loop)
        if (normalizedHref === currentPath) {
          return;
        }

        // Show loader immediately and track navigation start time and path
        navigationStartTimeRef.current = Date.now();
        navigationStartPathRef.current = currentPath;
        // Use setTimeout to defer state update and avoid useInsertionEffect error
        setTimeout(() => setNavigating(true), 0);
      }
    };

    // Intercept router.push calls by wrapping Next.js router
    const originalPush = window.history.pushState;
    window.history.pushState = function (...args) {
      // Check if it's a navigation (not just state change)
      const url = args[2];
      if (url && typeof url === 'string' && url.startsWith('/')) {
        // Normalize the URL to compare with current pathname
        const normalizedUrl = url.split('?')[0].split('#')[0]; // Remove query and hash
        const currentPath = pathnameRef.current || pathname;

        // Skip if navigating to the same path (prevents infinite loop)
        if (normalizedUrl !== currentPath) {
          navigationStartTimeRef.current = Date.now();
          navigationStartPathRef.current = currentPath;
          // Use setTimeout to defer state update and avoid useInsertionEffect error
          setTimeout(() => setNavigating(true), 0);
        }
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

    const resetScroll = () => {
      // Force unlock scroll - use empty string to reset to default
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    };

    if (isLoaderActive) {

      // Disable scrolling on both body and html (Safari fix)
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        // Always reset scroll on cleanup, regardless of original values
        resetScroll();
      };
    } else {
      // Ensure scroll is unlocked when loader is not active
      resetScroll();
    }
  }, [isNavigating, isInitialLoad]);

  // Safety mechanism: Ensure scroll is unlocked on pathname change
  // This handles cases where cleanup might not run properly
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Small delay to ensure all cleanup has run
    const timer = setTimeout(() => {
      const isLoaderActive =
        (isInitialLoad || isNavigating) &&
        !window.location.pathname.startsWith('/admin');

      if (!isLoaderActive) {
        // Force unlock scroll if loader is not active
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, isNavigating, isInitialLoad]);

  // Aggressive safety mechanism: Periodic check to ensure scroll is never stuck
  // This runs every 1 second to catch edge cases without interfering with modals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkInterval = setInterval(() => {
      const isLoaderActive =
        (isInitialLoad || isNavigating) &&
        !window.location.pathname.startsWith('/admin');

      if (!isLoaderActive) {
        // Check if scroll is locked when it shouldn't be
        const bodyOverflow = window.getComputedStyle(document.body).overflow;
        const htmlOverflow = window.getComputedStyle(document.documentElement).overflow;

        // Only unlock if scroll is locked AND no visible modal/overlay is present
        // Check for common modal patterns: fixed position elements covering viewport
        const hasVisibleOverlay = Array.from(document.querySelectorAll('body > *')).some((el) => {
          if (!(el instanceof HTMLElement)) return false;
          const styles = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();

          // Check if element is a full-screen overlay/modal
          return (
            styles.position === 'fixed' &&
            parseInt(styles.zIndex || '0') >= 40 &&
            styles.display !== 'none' &&
            styles.visibility !== 'hidden' &&
            styles.opacity !== '0' &&
            rect.width >= window.innerWidth * 0.9 &&
            rect.height >= window.innerHeight * 0.9
          );
        });

        // Only unlock if no modal/overlay is visible
        // This prevents interfering with open modals while still fixing stuck scroll
        if ((bodyOverflow === 'hidden' || htmlOverflow === 'hidden') && !hasVisibleOverlay) {
          // Force unlock scroll only when safe to do so
          document.body.style.overflow = '';
          document.body.style.height = '';
          document.documentElement.style.overflow = '';
        }
      }
    }, 1000); // Reduced frequency to 1 second to minimize interference

    return () => clearInterval(checkInterval);
  }, [isNavigating, isInitialLoad]);

  // Safety mechanism: Ensure scroll is unlocked on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        // Force unlock scroll on unmount
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
      }
    };
  }, []);

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
      {shouldShowLoader && <Loader fullscreen showLogo restoreScroll={false} />}
    </>
  );
}
