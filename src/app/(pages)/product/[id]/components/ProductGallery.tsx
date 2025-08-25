'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ZoomIn, X } from 'lucide-react';
import { Lens } from '@/app/components/ui/lens';
import { Product } from '@/lib/types/product';

interface ProductGalleryProps {
  product: Product;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export function ProductGallery({
  product,
  isModalOpen,
  setIsModalOpen,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  // const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // // Detect mobile
  // useEffect(() => {
  //   const checkMobile = () => {
  //     setIsMobile(window.innerWidth < 768);
  //   };
  //   checkMobile();
  //   window.addEventListener('resize', checkMobile);
  //   return () => window.removeEventListener('resize', checkMobile);
  // }, []);
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // cleanup in case modal unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);
  const openModal = (index: number) => {
    setSelectedImage(index);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Desktop Layout */}
      <div className="hidden md:flex gap-3 lg:gap-4">
        {/* Main Image */}
        <div
          className="flex-1 cursor-zoom-in"
          onClick={() => openModal(selectedImage)}
        >
          <Lens zoomFactor={3} lensSize={200}>
            <div
              ref={imageRef}
              className="relative aspect-square w-full overflow-hidden rounded-lg border border-primary/10"
            >
              <Image
                src={product.images[selectedImage]}
                alt={`${product.name} - Image ${selectedImage + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={selectedImage === 0}
              />
              <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5">
                <ZoomIn className="w-3 h-3 text-primary" />
              </div>
            </div>
          </Lens>
        </div>

        {/* Thumbnails */}
        <div className="flex flex-col gap-2 w-16 lg:w-20">
          {product.images.slice(0, 4).map((image, index) => {
            const isLastVisible = index === 3 && product.images.length > 4;
            return (
              <div
                key={index}
                onMouseEnter={() => setSelectedImage(index)}
                onClick={() => openModal(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                  selectedImage === index
                    ? 'border-primary'
                    : 'border-transparent hover:border-primary/50'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                    +{product.images.length - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-lg border border-primary/10 cursor-zoom-in"
          onClick={() => openModal(selectedImage)}
        >
          <Image
            src={product.images[selectedImage]}
            alt={`${product.name} - Image ${selectedImage + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={selectedImage === 0}
          />
        </div>

        {/* Mobile Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                  selectedImage === index
                    ? 'border-primary'
                    : 'border-transparent hover:border-primary/50'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-6xl h-[90vh] grid grid-cols-1 lg:grid-cols-[1fr_380px] overflow-hidden">
            {/* Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 p-1 bg-black/20 rounded-full text-sm text-white  z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
              <Lens zoomFactor={3} lensSize={200}>
                <div className="relative flex items-center justify-center max-h-full max-w-full w-auto h-auto">
                  <Image
                    src={product.images[selectedImage]}
                    alt={`${product.name} - modal image ${selectedImage + 1}`}
                    width={1000} // instead of fill
                    height={1000}
                    className="max-h-[80vh] max-w-full object-contain"
                  />
                </div>
              </Lens>
            </div>

            {/* Thumbnails */}

            {/* aside */}
            <aside className="relative border-t lg:border-t-0 lg:border-l p-4 lg:p-6 bg-white overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-lg font-bold text-primary mb-4">
                ₹{product.price}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {product.description}
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex lg:flex-col gap-2 w-full lg:w-24 overflow-y-auto lg:overflow-x-hidden overflow-x-auto p-4">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square w-16 lg:w-full flex-shrink-0 overflow-hidden rounded-lg border-2 cursor-pointer ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
