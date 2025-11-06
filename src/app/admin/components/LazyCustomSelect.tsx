'use client';

import dynamic from 'next/dynamic';

// Lazy load CustomSelect - only loads when dropdown is used
export const CustomSelect = dynamic(
  () => import('./CustomSelect').then(mod => ({ default: mod.CustomSelect })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    ),
  }
);

