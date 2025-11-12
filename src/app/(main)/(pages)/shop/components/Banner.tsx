'use client';

import React from 'react';
import Image from '@/app/(main)/components/ui/FallbackImage';
import { StaticImageData } from 'next/image';

interface BannerImageProps {
  desktopSrc: string | StaticImageData;
  mobileSrc: string | StaticImageData;
  alt?: string;
  className?: string;
}

const BannerImage: React.FC<BannerImageProps> = ({
  desktopSrc,
  mobileSrc,
  alt = 'Banner',
  className = '',
}) => {
  return (
    <div className={`w-full relative ${className}`}>
      {/* Mobile Image */}
      <div className="block md:hidden">
        <Image
          src={mobileSrc}
          alt={alt}
          width={800}
          height={600}
          layout="responsive"
          className="w-full object-cover"
          priority
        />
      </div>

      {/* Desktop Image */}
      <div className="hidden md:block">
        <Image
          src={desktopSrc}
          alt={alt}
          width={1920}
          height={600}
          layout="responsive"
          className="w-full object-cover"
          priority
        />
      </div>
    </div>
  );
};

export default BannerImage;
