'use client';

import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/data/mainStore/navigationStore';

/**
 * Hook that wraps Next.js router with automatic loader management
 * Use this instead of useRouter() when you want to show loader on navigation
 */
export function useNavigationWithLoader() {
  const router = useRouter();
  const { setNavigating } = useNavigationStore();

  return {
    push: (href: string) => {
      setNavigating(true);
      router.push(href);
    },
    replace: (href: string) => {
      setNavigating(true);
      router.replace(href);
    },
    back: () => {
      setNavigating(true);
      router.back();
    },
    forward: () => {
      setNavigating(true);
      router.forward();
    },
    refresh: router.refresh,
    prefetch: router.prefetch,
  };
}

