'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        duration: 3500,
        classNames: {
          toast:
            'rounded-xl backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/70 border border-primary/10 shadow-sm',
          success: 'bg-green-50 text-green-700 border-green-200',
          error: 'bg-rose-50 text-rose-700 border-rose-200',
          warning: 'bg-amber-50 text-amber-700 border-amber-200',
          info: 'bg-[oklch(0.66_0.14_358.91)]/10 text-[oklch(0.66_0.14_358.91)] border-[oklch(0.66_0.14_358.91)]/20',
          title: 'font-semibold',
          description: 'text-gray-600',
          closeButton:
            'rounded-md border border-transparent hover:border-gray-200',
        },
      }}
    />
  );
} 