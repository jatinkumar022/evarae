'use client';
import Image from '@/app/(main)/components/ui/FallbackImage';

interface ManufacturerImagesProps {
  images: string[]; // array of image URLs
}

export function ManufacturerImages({ images }: ManufacturerImagesProps) {
  return (
    <div className="my-8">
      <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
        From the Manufacturer
      </h2>
      <div className="space-y-6">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-muted/30"
          >
            <Image
              src={src}
              alt={`Manufacturer Image ${idx + 1}`}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
