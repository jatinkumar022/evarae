'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { StaticImageData } from 'next/image';
import { NoImagePlaceholder } from '@/app/(main)/assets/Common';

type ImageSource = ImageProps['src'];

type FallbackImageProps = Omit<ImageProps, 'src'> & {
  /**
   * The primary image source. If the source is nullish or fails to load,
   * the `fallbackSrc` will be displayed instead.
   */
  src?: ImageSource;
  /**
   * Optional override for the fallback image source. Defaults to the shared
   * "no image" placeholder used across the main application shell.
   */
  fallbackSrc?: ImageSource;
};

const isStaticImageData = (value: ImageSource | undefined): value is StaticImageData => {
  return typeof value === 'object' && value !== null && 'src' in value;
};

const areSourcesEqual = (a?: ImageSource, b?: ImageSource) => {
  if (a === b) {
    return true;
  }

  if (isStaticImageData(a) && isStaticImageData(b)) {
    return a.src === b.src;
  }

  return false;
};

const coerceSrc = (src?: ImageSource): ImageSource | undefined => {
  if (!src) {
    return undefined;
  }

  // Handle string sources
  if (typeof src === 'string') {
    const trimmed = src.trim();
    // Reject empty strings, JSON object strings, or invalid values
    if (trimmed.length === 0 || trimmed === '{}' || trimmed === 'null' || trimmed === 'undefined') {
      return undefined;
    }
    return trimmed;
  }

  // Handle object sources
  if (typeof src === 'object' && src !== null) {
    // Check if it's StaticImageData
    if (isStaticImageData(src)) {
      const staticSrc = typeof src.src === 'string' ? src.src.trim() : '';
      return staticSrc.length > 0 ? src : undefined;
    }

    // Check if it's an empty object
    const keys = Object.keys(src);
    if (keys.length === 0) {
      return undefined;
    }

    // Try to extract a valid image URL from common properties
    const possibleKeys = ['url', 'uri', 'image', 'imageUrl', 'secure_url', 'path', 'src'];
    const record = src as unknown as Record<string, unknown>;
    for (const key of possibleKeys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    // If no valid image property found, return undefined
    return undefined;
  }

  return undefined;
};

const FallbackImage = ({
  src,
  fallbackSrc = NoImagePlaceholder,
  onError,
  onLoadingComplete,
  className,
  ...rest
}: FallbackImageProps) => {
  const safeFallback = useMemo(() => fallbackSrc ?? NoImagePlaceholder, [fallbackSrc]);
  
  // Improved initial state - ensure we never start with an invalid src
  const [currentSrc, setCurrentSrc] = useState<ImageSource>(() => {
    const coerced = coerceSrc(src);
    // If coerceSrc returns undefined or an empty object, use fallback
    if (!coerced) {
      return safeFallback;
    }
    // Double-check for empty objects
    if (typeof coerced === 'object' && !isStaticImageData(coerced) && Object.keys(coerced).length === 0) {
      return safeFallback;
    }
    return coerced;
  });

  useEffect(() => {
    const coerced = coerceSrc(src);
    // Ensure we never set an empty object or invalid src
    const nextSrc = coerced ?? safeFallback;
    
    // Double-check: if nextSrc is an empty object, use fallback
    const isValidSrc = nextSrc && (
      typeof nextSrc === 'string' ||
      isStaticImageData(nextSrc) ||
      (typeof nextSrc === 'object' && nextSrc !== null && Object.keys(nextSrc).length > 0 && ('src' in nextSrc || 'default' in nextSrc))
    );
    
    const finalSrc = isValidSrc ? nextSrc : safeFallback;

    setCurrentSrc((prev) => {
      if (areSourcesEqual(prev, finalSrc)) {
        return prev;
      }

      return finalSrc;
    });
  }, [safeFallback, src]);

  const handleError: ImageProps['onError'] = (event) => {
    if (!areSourcesEqual(currentSrc, safeFallback)) {
      setCurrentSrc(safeFallback);
    }

    onError?.(event);
  };

  const handleLoadingComplete: ImageProps['onLoadingComplete'] = (img) => {
    if ((img.naturalWidth === 0 || img.naturalHeight === 0) && !areSourcesEqual(currentSrc, safeFallback)) {
      setCurrentSrc(safeFallback);
      return;
    }

    onLoadingComplete?.(img);
  };

  const mergedClassName = useMemo(
    () => [className, 'bg-[#F2F2F2]'].filter(Boolean).join(' '),
    [className],
  );

  // Ensure we always have a valid src (fallback to safeFallback if currentSrc is invalid)
  const finalSrc = useMemo(() => {
    // Handle null/undefined
    if (!currentSrc) {
      return safeFallback;
    }

    // Handle empty object {}
    if (typeof currentSrc === 'object' && currentSrc !== null) {
      // Check if it's StaticImageData (has 'src' property)
      if (isStaticImageData(currentSrc)) {
        const staticSrc = typeof currentSrc.src === 'string' ? currentSrc.src.trim() : '';
        return staticSrc.length > 0 ? currentSrc : safeFallback;
      }
      
      // If it's a plain object, check if it's empty or has no valid image properties
      const keys = Object.keys(currentSrc);
      if (keys.length === 0) {
        return safeFallback;
      }
      
      // Check for common image URL properties
      const possibleKeys = ['url', 'uri', 'image', 'imageUrl', 'secure_url', 'path', 'src'];
      const hasValidImageProp = possibleKeys.some(key => {
        const value = (currentSrc as unknown as Record<string, unknown>)[key];
        return typeof value === 'string' && value.trim().length > 0;
      });
      
      if (!hasValidImageProp) {
        return safeFallback;
      }
    }

    // Handle string - ensure it's not empty
    if (typeof currentSrc === 'string') {
      return currentSrc.trim().length > 0 ? currentSrc : safeFallback;
    }

    return currentSrc;
  }, [currentSrc, safeFallback]);

  // Final safety check: Never pass empty string to Next.js Image
  const safeSrc = useMemo(() => {
    if (!finalSrc) return safeFallback;
    
    // Handle string sources - reject empty strings
    if (typeof finalSrc === 'string') {
      const trimmed = finalSrc.trim();
      if (trimmed.length === 0 || 
          trimmed === '""' || 
          trimmed === "''" ||
          trimmed === 'null' ||
          trimmed === 'undefined') {
        return safeFallback;
      }
      return trimmed;
    }
    
    // Handle StaticImageData
    if (isStaticImageData(finalSrc)) {
      const staticSrc = typeof finalSrc.src === 'string' ? finalSrc.src.trim() : '';
      if (staticSrc.length === 0) {
        return safeFallback;
      }
      return finalSrc;
    }
    
    return finalSrc;
  }, [finalSrc, safeFallback]);

  // Final validation - ensure we never pass empty string
  if (!safeSrc) {
    return null;
  }
  
  // Double-check for empty strings
  if (typeof safeSrc === 'string' && safeSrc.trim().length === 0) {
    return null;
  }

  return (
    <Image
      {...rest}
      src={safeSrc}
      alt={rest.alt || ''}
      onError={handleError}
      onLoadingComplete={handleLoadingComplete}
      className={mergedClassName || undefined}
    />
  );
};

export default FallbackImage;

