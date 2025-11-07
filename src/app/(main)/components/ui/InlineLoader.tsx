'use client';

import React from 'react';

interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'white';
}

/**
 * InlineLoader - A small spinner for buttons and inline actions
 * Use this for non-GET requests (POST, PUT, DELETE, etc.)
 * Uses the same spinner pattern as the main Loader component
 */
export default function InlineLoader({ 
  size = 'sm', 
  className = '',
  variant = 'default'
}: InlineLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-6 w-6 border-3',
  };

  const outerRingClass = variant === 'white'
    ? 'border-white/30'
    : 'border-gray-200';
  
  const innerRingClass = variant === 'white'
    ? 'border-transparent border-t-white border-r-white'
    : 'border-transparent border-t-primary border-r-primary';

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div className={`animate-spin rounded-full ${outerRingClass} ${sizeClasses[size]}`}></div>
        {/* Inner spinning ring */}
        <div className={`animate-spin rounded-full ${innerRingClass} ${sizeClasses[size]} absolute top-0 left-0`}></div>
      </div>
    </div>
  );
}

