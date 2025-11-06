/**
 * Image optimization utilities
 * Provides optimized blur placeholder and loading strategies
 */

// Base64 encoded 1x1 transparent pixel for blur placeholder
export const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

/**
 * Get optimal image sizes for different contexts
 */
export const getImageSizes = (context: 'card' | 'detail' | 'thumbnail' | 'banner') => {
  switch (context) {
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';
    case 'detail':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    case 'thumbnail':
      return '(max-width: 640px) 50vw, 128px';
    case 'banner':
      return '100vw';
    default:
      return '(max-width: 768px) 100vw, 50vw';
  }
};

/**
 * Determine if image should be priority loaded (above the fold)
 */
export const shouldPriorityLoad = (index: number, context: 'card' | 'detail' | 'thumbnail' | 'banner') => {
  if (context === 'banner') return true;
  if (context === 'card' && index < 4) return true; // First row of cards
  if (context === 'detail' && index === 0) return true; // First detail image
  return false;
};

