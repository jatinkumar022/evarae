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

  if (typeof src === 'string') {
    const trimmed = src.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof src === 'object' && src !== null) {
    if (isStaticImageData(src)) {
      const staticSrc = typeof src.src === 'string' ? src.src.trim() : '';
      return staticSrc.length > 0 ? src : undefined;
    }

    const possibleKeys = ['url', 'uri', 'image', 'imageUrl', 'secure_url', 'path'];
    const record = src as unknown as Record<string, unknown>;
    for (const key of possibleKeys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

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
  const [currentSrc, setCurrentSrc] = useState<ImageSource>(() => coerceSrc(src) ?? safeFallback);

  useEffect(() => {
    const nextSrc = coerceSrc(src) ?? safeFallback;

    setCurrentSrc((prev) => {
      if (areSourcesEqual(prev, nextSrc)) {
        return prev;
      }

      return nextSrc;
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
    if (!currentSrc) {
      return safeFallback;
    }
    // If currentSrc is an empty object (not StaticImageData), use fallback
    if (typeof currentSrc === 'object' && !isStaticImageData(currentSrc)) {
      if (Object.keys(currentSrc).length === 0) {
        return safeFallback;
      }
    }
    return currentSrc;
  }, [currentSrc, safeFallback]);

  return (
    <Image
      {...rest}
      src={finalSrc}
      alt={rest.alt || ''}
      onError={handleError}
      onLoadingComplete={handleLoadingComplete}
      className={mergedClassName || undefined}
    />
  );
};

export default FallbackImage;

