'use client';

import { Loader2 } from 'lucide-react';

interface InlineSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * InlineSpinner - A small spinning loader for inline use in admin pages
 * Use for: button loading states, inline actions, table row indicators
 */
export default function InlineSpinner({ 
  size = 'sm', 
  className = '' 
}: InlineSpinnerProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Loader2 
      className={`${sizeClasses[size]} animate-spin text-primary-600 dark:text-primary-400 ${className}`}
      aria-hidden="true"
    />
  );
}

