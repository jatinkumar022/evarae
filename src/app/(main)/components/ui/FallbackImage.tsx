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

  if (typeof src === 'string' && src.trim().length === 0) {
    return undefined;
  }

  return src;
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

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={rest.alt || ''}
      onError={handleError}
      onLoadingComplete={handleLoadingComplete}
      className={mergedClassName || undefined}
    />
  );
};

export default FallbackImage;

