'use client';

import React from 'react';
import { LoaderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn('h-4 w-4 animate-spin', className)}
      {...props}
    />
  );
}

export function SpinnerCentered({ className }: { className?: string }) {
  return (
    <div className={cn('relative inline-flex w-full items-center justify-center', className)}>
      <Spinner className="absolute" />
    </div>
  );
}

