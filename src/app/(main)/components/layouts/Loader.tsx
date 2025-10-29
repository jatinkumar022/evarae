// components/Loader.tsx
import React from 'react';

interface LoaderProps {
  text?: string;
  fullscreen?: boolean;
  showLogo?: boolean;
}

const Loader = ({ text = 'Loading...', fullscreen = false, showLogo = false }: LoaderProps) => {
  const spinner = (
    <div className="relative">
      {/* Outer ring */}
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
      {/* Inner spinning ring */}
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary border-r-primary absolute top-0 left-0"></div>
    </div>
  );

  const logoSpinner = (
    <div className="relative mb-8">
      {/* Logo container */}
      <div className="w-20 h-20 mx-auto mb-6 relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm font-heading ">C</span>
          </div>
        </div>
      </div>
      {/* Puff loader ring (storybook-style) */}
      <div className="absolute -inset-4 flex items-center justify-center">
        <svg
          className="h-24 w-24 text-primary"
          viewBox="0 0 44 44"
          fill="none"
          aria-hidden="true"
        >
          <g stroke="currentColor" strokeWidth="2">
            <circle cx="22" cy="22" r="1">
              <animate attributeName="r" begin="0s" dur="2.4s" values="1; 20" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="0s" dur="2.4s" values="1; 0" repeatCount="indefinite" />
            </circle>
            <circle cx="22" cy="22" r="1">
              <animate attributeName="r" begin="-1.2s" dur="2.4s" values="1; 20" repeatCount="indefinite" />
              <animate attributeName="opacity" begin="-1.2s" dur="2.4s" values="1; 0" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="text-center">
          {showLogo ? logoSpinner : spinner}
      
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        {showLogo ? logoSpinner : spinner}
        <div className="space-y-2">
          <p className="text-gray-600 font-medium">{text}</p>
          <div className="flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
