'use client';

import dynamic from 'next/dynamic';

// Lazy load ProductOptionsModal - only loads when modal opens
export const LazyProductOptionsModal = dynamic(
  () => import('./ProductOptionsModal').then(mod => ({ default: mod.default })),
  {
    ssr: false, // Modal only needed on client
    loading: () => null, // No loading state needed as modal handles its own state
  }
);

