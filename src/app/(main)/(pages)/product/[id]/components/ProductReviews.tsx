'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types/product';
import {
  Star,
  StarHalf,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  X,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';
import CustomSelect from '@/app/(main)/components/filters/CustomSelect';
import { one, two, three, four, five } from '@/app/(main)/assets/Home/CAROUSEL';
import {
  signOne,
  signTwo,
  signThree,
} from '@/app/(main)/assets/Home/Signature';

interface ProductReviewsProps {
  product: Product;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    author: 'Priya Sharma',
    rating: 5,
    title: 'Absolutely stunning piece!',
    comment:
      'This jewellery piece exceeded my expectations. The quality is exceptional and it looks even better in person. The craftsmanship is outstanding and the design is timeless. I received so many compliments when I wore it to a wedding. Highly recommended!',
    date: '2024-01-15',
    verified: true,
    helpful: 12,
    images: [one.src, two.src, signOne.src],
  },
  {
    id: '2',
    author: 'Rahul Patel',
    rating: 4,
    title: 'Beautiful design, great quality',
    comment:
      'The craftsmanship is excellent and the design is timeless. Very happy with my purchase. The delivery was prompt and the packaging was secure. The piece looks exactly like the images.',
    date: '2024-01-10',
    verified: true,
    helpful: 8,
    images: [three.src],
  },
  {
    id: '3',
    author: 'Anjali Desai',
    rating: 5,
    title: 'Perfect for special occasions',
    comment:
      "I wore this to my sister's wedding and received so many compliments. The quality is outstanding and the design is elegant. The piece is comfortable to wear and the finish is impeccable.",
    date: '2024-01-05',
    verified: true,
    helpful: 15,
    images: [four.src, five.src, signTwo.src, signThree.src],
  },
  {
    id: '4',
    author: 'Meera Singh',
    rating: 5,
    title: 'Exceeded all expectations',
    comment:
      'This is my third purchase from Caelvi and they never disappoint. The quality is consistently excellent and the customer service is outstanding. The piece arrived well-packaged and in perfect condition.',
    date: '2024-01-02',
    verified: true,
    helpful: 6,
  },
  {
    id: '5',
    author: 'Vikram Kumar',
    rating: 4,
    title: 'Great value for money',
    comment:
      'The quality is good for the price point. The design is classic and versatile. I would definitely recommend this to others looking for elegant jewellery.',
    date: '2023-12-28',
    verified: true,
    helpful: 4,
  },
];

// Lightbox entry linking a photo to its review
interface LightboxEntry {
  src: string;
  review: Review;
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [withImagesOnly, setWithImagesOnly] = useState(false);

  // Build global photos array once
  const allPhotoEntries: LightboxEntry[] = mockReviews.flatMap(review =>
    (review.images || []).map(src => ({ src, review }))
  );

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxEntries, setLightboxEntries] = useState<LightboxEntry[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const currentEntry = lightboxEntries[lightboxIndex];

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft')
        setLightboxIndex(
          i => (i - 1 + lightboxEntries.length) % lightboxEntries.length
        );
      if (e.key === 'ArrowRight')
        setLightboxIndex(i => (i + 1) % lightboxEntries.length);
    };
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isLightboxOpen, lightboxEntries.length]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={i}
          className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className="w-3 h-3 lg:w-4 lg:h-4 text-gray-300"
        />
      );
    }

    return stars;
  };

  const allPhotos = allPhotoEntries.map(e => e.src);

  const filteredReviews = (
    withImagesOnly
      ? mockReviews.filter(r => (r.images?.length || 0) > 0)
      : mockReviews
  ).slice(0, showAllReviews ? mockReviews.length : 3);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-semibold text-primary-dark mb-1 lg:mb-2">
            Customer Reviews
          </h2>
          <p className="text-primary-dark/70 text-sm">
            {product.reviews} reviews • {product.rating} average rating
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLightboxEntries(allPhotoEntries);
              setLightboxIndex(0);
              setIsLightboxOpen(true);
            }}
            className="bg-primary text-white px-3 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm"
          >
            See all photos ({allPhotos.length})
          </button>
          <button className="bg-primary text-white px-4 lg:px-6 py-2  rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm lg:text-base self-start sm:self-auto">
            <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4" />
            Write a Review
          </button>
        </div>
      </div>

      {/* Photos from customers */}
      {allPhotos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allPhotos.slice(0, 12).map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLightboxEntries(allPhotoEntries);
                setLightboxIndex(idx);
                setIsLightboxOpen(true);
              }}
              className="relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-md border"
              aria-label={`Open photo ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`Customer photo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Review Summary */}
      <div className="bg-primary/5 rounded-lg p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary-dark">
              {product.rating}
            </div>
            <div className="flex items-center gap-1 my-1 lg:my-2 justify-center">
              {renderStars(product.rating)}
            </div>
            <div className="text-sm text-primary-dark">
              {product.reviews} reviews
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-1.5 lg:space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = Math.floor(Math.random() * 10) + 1; // Mock data
                const percentage = (count / product.reviews) * 100;
                return (
                  <div key={star} className="flex items-center gap-2 lg:gap-3">
                    <span className="text-xs lg:text-sm text-primary-dark w-3 lg:w-4">
                      {star}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 lg:h-2">
                      <div
                        className="bg-primary h-1.5 lg:h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs lg:text-sm text-primary-dark w-6 lg:w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sort and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 lg:gap-4">
          <span className="text-xs lg:text-sm text-primary-dark">Sort by:</span>

          <CustomSelect
            options={[
              { label: 'Most Recent', value: 'recent' },
              { label: 'Most Helpful', value: 'helpful' },
              { label: 'Highest Rating', value: 'rating' },
              { label: 'Lowest Rating', value: 'lowest' },
            ]}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Select"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs lg:text-sm text-primary-dark">
            <input
              type="checkbox"
              checked={withImagesOnly}
              onChange={e => setWithImagesOnly(e.target.checked)}
            />
            With images only
          </label>
          <span className="text-xs lg:text-sm text-primary-dark">
            Showing{' '}
            {withImagesOnly
              ? filteredReviews.length
              : showAllReviews
              ? mockReviews.length
              : 3}{' '}
            of {mockReviews.length} reviews
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 lg:space-y-6">
        {filteredReviews.map(review => (
          <div
            key={review.id}
            className="border-b border-primary/10 pb-4 lg:pb-6 last:border-b-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 lg:gap-3 mb-2 lg:mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold  text-sm lg:text-base">
                    {review.author}
                  </h4>
                  {review.verified && (
                    <span className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1 lg:mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-xs lg:text-sm">{review.title}</span>
                </div>
              </div>
              <span className="text-xs  text-primary-dark">
                {new Date(review.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-500 leading-relaxed text-xs lg:text-sm mb-2 lg:mb-3">
              {review.comment}
            </p>

            {/* Review images thumbnails */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                {review.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const globalIndex = allPhotoEntries.findIndex(
                        e => e.review.id === review.id && e.src === img
                      );
                      setLightboxEntries(allPhotoEntries);
                      setLightboxIndex(globalIndex >= 0 ? globalIndex : 0);
                      setIsLightboxOpen(true);
                    }}
                    className="relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-md border"
                    aria-label={`Open ${review.author} photo ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${review.author} photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Review Actions */}
            <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm">
              <button className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors">
                <ThumbsUp className="w-3 h-3 lg:w-4 lg:h-4" />
                Helpful ({review.helpful})
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-gray-600 transition-colors">
                <ThumbsDown className="w-3 h-3 lg:w-4 lg:h-4" />
                Not Helpful
              </button>
              <button className="text-red-400 hover:text-primary-dark transition-colors">
                Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {mockReviews.length > 3 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-primary hover:text-primary-dark font-medium transition-colors text-sm lg:text-base"
          >
            {showAllReviews
              ? 'Show Less'
              : `Show All ${mockReviews.length} Reviews`}
          </button>
        </div>
      )}

      {/* Lightbox Modal with details panel */}
      {isLightboxOpen && currentEntry && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white rounded-lg w-full max-w-6xl h-[90vh] grid grid-cols-1 md:grid-cols-[1fr_380px] overflow-hidden">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-3 right-3 bg-black/70 text-white rounded-full p-2 z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image area */}
            <div className="relative flex items-center justify-center bg-white">
              {lightboxEntries.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightboxIndex(
                        i =>
                          (i - 1 + lightboxEntries.length) %
                          lightboxEntries.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setLightboxIndex(i => (i + 1) % lightboxEntries.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="relative w-full h-full flex items-center justify-center p-3 md:p-6">
                <Image
                  src={currentEntry.src}
                  alt={`Review image`}
                  width={1200}
                  height={1200}
                  className="object-contain max-h-full max-w-full"
                />
              </div>
            </div>

            {/* Details panel */}
            <aside className="relative border-t md:border-t-0 md:border-l p-4 md:p-6 bg-white overflow-y-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {currentEntry.review.author
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {currentEntry.review.author}
                    </span>
                    {currentEntry.review.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                        <BadgeCheck className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(currentEntry.review.rating)}
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {currentEntry.review.title}
              </h4>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                {currentEntry.review.comment}
              </p>
              <div className="text-[11px] text-gray-500 mb-3">
                {new Date(currentEntry.review.date).toLocaleDateString()}
              </div>

              {/* Thumbs for this review */}
              {currentEntry.review.images &&
                currentEntry.review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {currentEntry.review.images.map((img, idx) => {
                      const globalIdx = allPhotoEntries.findIndex(
                        e =>
                          e.review.id === currentEntry.review.id &&
                          e.src === img
                      );
                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            setLightboxIndex(globalIdx >= 0 ? globalIdx : 0)
                          }
                          className={`relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                            lightboxIndex === globalIdx
                              ? 'border-primary'
                              : 'border-transparent hover:border-primary/50'
                          }`}
                          aria-label={`Select image ${idx + 1}`}
                        >
                          <Image
                            src={img}
                            alt={`Thumb ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

              {/* Actions */}
              <div className="flex items-center gap-3 text-xs">
                <button className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors">
                  <ThumbsUp className="w-4 h-4" /> Helpful (
                  {currentEntry.review.helpful})
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-600 transition-colors">
                  <ThumbsDown className="w-4 h-4" /> Not Helpful
                </button>
                <button className="ml-auto text-gray-400 hover:text-gray-600">
                  Report
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
