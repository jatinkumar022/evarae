// components/Loader.tsx
import React from 'react';

interface LoaderProps {
  text?: string;
  fullscreen?: boolean;
}

const Loader = ({ text = 'Loading...', fullscreen = false }: LoaderProps) => {
  const spinner = (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
        <div className="text-center">
          {spinner}
          <p className="text-gray-700">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        {spinner}
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
