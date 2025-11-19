'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from '@/app/(main)/components/ui/FallbackImage';
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
  Shield,
  Loader2,
} from 'lucide-react';
import CustomSelect from '@/app/(main)/components/filters/CustomSelect';
import toastApi from '@/lib/toast';
import { useUserAccountStore } from '@/lib/data/mainStore/userAccountStore';
import LoginPromptModal from '@/app/(main)/components/ui/LoginPromptModal';
import WriteReviewModal from './WriteReviewModal';
import {
  ProductReview,
  ProductReviewSummary,
  useProductReviewStore,
} from '@/lib/data/mainStore/productReviewStore';

interface ProductReviewsProps {
  product: Product;
}

type RatingBreakdown = Record<'1' | '2' | '3' | '4' | '5', number>;

interface LightboxEntry {
  src: string;
  review: ProductReview;
}

const DEFAULT_BREAKDOWN: RatingBreakdown = {
  '1': 0,
  '2': 0,
  '3': 0,
  '4': 0,
  '5': 0,
};

const AVATAR_COLORS = [
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
] as const;

const getAvatarInitials = (name?: string) => {
  if (!name) return 'CU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'CU';
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

const getAvatarColors = (seed?: string) => {
  if (!seed) return AVATAR_COLORS[0];
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

interface UserAvatarProps {
  name?: string;
  sizeClass?: string;
  dotSizeClass?: string;
  textSizeClass?: string;
}

const UserAvatar = ({
  name,
  sizeClass = 'w-11 h-11',
  dotSizeClass = 'w-3 h-3',
  textSizeClass = 'text-sm',
}: UserAvatarProps) => {
  const { bg, text } = getAvatarColors(name);
  return (
    <div className={`relative ${sizeClass} rounded-full flex items-center justify-center font-semibold shadow-sm`}>
      <div className={`w-full h-full rounded-full flex items-center justify-center ${bg} ${text} ${textSizeClass}`}>
        {getAvatarInitials(name)}
      </div>
      <span className={`absolute bottom-0 right-0 rounded-full bg-emerald-400 border-2 border-white ${dotSizeClass}`} />
    </div>
  );
};

export function ProductReviews({ product }: ProductReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [withImagesOnly, setWithImagesOnly] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxEntries, setLightboxEntries] = useState<LightboxEntry[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [pendingHelpful, setPendingHelpful] = useState<{
    id: string;
    type: 'add' | 'remove';
    source: 'helpful' | 'notHelpful';
  } | null>(null);
  const [notHelpfulStates, setNotHelpfulStates] = useState<Record<string, boolean>>({});
  const [reportingReview, setReportingReview] = useState<ProductReview | null>(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');

  const user = useUserAccountStore(state => state.user);
  const entries = useProductReviewStore(state => state.entries);
  const fetchReviews = useProductReviewStore(state => state.fetchReviews);
  const refreshReviews = useProductReviewStore(state => state.refreshReviews);

  const entry = entries[product.id];
  const reviews = entry?.reviews ?? [];
  const summary = entry?.summary;
  const initialLoading = !entry || (entry.status === 'loading' && !entry.lastFetched);
  const storeError = entry?.error;

  useEffect(() => {
    fetchReviews(product.id);
  }, [fetchReviews, product.id]);

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
    const originalBodyOverflow = window.getComputedStyle(document.body).overflow;
    const originalHtmlOverflow =
      window.getComputedStyle(document.documentElement).overflow;
    const originalBodyHeight = document.body.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isLightboxOpen, lightboxEntries.length]);

  const effectiveSummary: ProductReviewSummary = summary || {
    averageRating: product.rating ?? 0,
    reviewCount: product.reviews ?? 0,
    verifiedCount: 0,
    ratingBreakdown: DEFAULT_BREAKDOWN,
  };

  const ratingBreakdown = effectiveSummary.ratingBreakdown || DEFAULT_BREAKDOWN;
  const averageRating =
    typeof effectiveSummary.averageRating === 'number'
      ? effectiveSummary.averageRating
      : product.rating;
  const reviewCount = effectiveSummary.reviewCount ?? product.reviews ?? 0;

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

  const sortedReviews = useMemo(() => {
    const arr = [...reviews];
    switch (sortBy) {
      case 'helpful':
        return arr.sort(
          (a, b) => (b.helpfulVotes ?? 0) - (a.helpfulVotes ?? 0)
        );
      case 'rating':
        return arr.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return arr.sort((a, b) => a.rating - b.rating);
      default:
        return arr.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [reviews, sortBy]);

  const baseReviews = useMemo(() => {
    return withImagesOnly
      ? sortedReviews.filter(r => (r.images?.length || 0) > 0)
      : sortedReviews;
  }, [sortedReviews, withImagesOnly]);

  const displayedReviews = useMemo(() => {
    return showAllReviews ? baseReviews : baseReviews.slice(0, 3);
  }, [baseReviews, showAllReviews]);

  const allPhotoEntries = useMemo<LightboxEntry[]>(
    () =>
      reviews.flatMap(review =>
        (review.images || []).map(src => ({ src, review }))
      ),
    [reviews]
  );

  const allPhotos = useMemo(
    () => allPhotoEntries.map(entry => entry.src),
    [allPhotoEntries]
  );

  const currentEntry = lightboxEntries[lightboxIndex];

  const handleWriteReviewClick = useCallback(() => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    setIsWriteReviewOpen(true);
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ productId?: string }>;
      if (!custom.detail || custom.detail.productId === product.id) {
        handleWriteReviewClick();
      }
    };
    window.addEventListener('open-write-review', handler);
    return () => window.removeEventListener('open-write-review', handler);
  }, [handleWriteReviewClick, product.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('product-rating-updated', {
        detail: {
          productId: product.id,
          rating: averageRating,
          reviewCount,
        },
      })
    );
  }, [averageRating, reviewCount, product.id]);

  const clearNotHelpfulState = useCallback((reviewId: string) => {
    setNotHelpfulStates(prev => {
      if (!prev[reviewId]) return prev;
      const { [reviewId]: _ignored, ...rest } = prev;
      return rest;
    });
  }, []);

  const activateNotHelpfulState = useCallback((reviewId: string) => {
    setNotHelpfulStates(prev => {
      if (prev[reviewId]) return prev;
      return { ...prev, [reviewId]: true };
    });
  }, []);

  const handleHelpfulVote = async (
    reviewId: string,
    source: 'helpful' | 'notHelpful' = 'helpful'
  ) => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    if (pendingHelpful) return;

    const review = reviews.find(r => r._id === reviewId);
    const hasVoted = review?.viewerHasVoted ?? false;
    const action: 'add' | 'remove' = hasVoted ? 'remove' : 'add';

    setPendingHelpful({ id: reviewId, type: hasVoted ? 'remove' : 'add', source });
    try {
      const method = hasVoted ? 'DELETE' : 'POST';
      const res = await fetch(
        `/api/products/${encodeURIComponent(product.id)}/reviews/${reviewId}/helpful`,
        { method }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMessage = data.error || 'Failed to update helpful vote';

        // Handle authentication errors
        if (res.status === 401) {
          setLoginPromptOpen(true);
          return;
        }

        throw new Error(errorMessage);
      }

      await refreshReviews(product.id);
      if (action === 'add') {
        clearNotHelpfulState(reviewId);
      }
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update helpful vote';
      toastApi.error('Action failed', message);
      return false;
    } finally {
      setPendingHelpful(null);
    }
  };

  const handleNotHelpful = async (reviewId: string) => {
    const review = reviews.find(r => r._id === reviewId);
    const hasVoted = review?.viewerHasVoted ?? false;

    if (hasVoted) {
      const removed = await handleHelpfulVote(reviewId, 'notHelpful');
      if (!removed) return;
    }

    activateNotHelpfulState(reviewId);
  };

  const reportReasons = [
    { id: 'spam', label: 'Spam or promotional' },
    { id: 'abuse', label: 'Abusive or hateful' },
    { id: 'off-topic', label: 'Off topic' },
    { id: 'other', label: 'Something else' },
  ] as const;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toastApi.success('Report submitted', 'Thanks for helping us keep reviews clean.');
    setReportingReview(null);
    setReportDetails('');
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-semibold text-primary-dark mb-1 lg:mb-2">
            Customer Reviews
          </h2>
          <p className="text-primary-dark/70 text-sm">
            {reviewCount} reviews • {averageRating.toFixed(1)} average rating
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (allPhotoEntries.length === 0) {
                toastApi.info('No photos yet', 'Be the first to add one!');
                return;
              }
              setLightboxEntries(allPhotoEntries);
              setLightboxIndex(0);
              setIsLightboxOpen(true);
            }}
            className="bg-primary text-white px-4 lg:px-6 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm lg:text-base self-start sm:self-auto w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={allPhotoEntries.length === 0}
          >
            See all photos ({allPhotos.length})
          </button>
          <button
            onClick={handleWriteReviewClick}
            className="bg-primary text-white px-4 lg:px-6 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm lg:text-base self-start sm:self-auto w-full sm:w-auto"
          >
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
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 my-1 lg:my-2 justify-center">
              {renderStars(averageRating)}
            </div>
            <div className="text-sm text-primary-dark">
              {reviewCount} reviews
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-1.5 lg:space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const key = String(star) as keyof RatingBreakdown;
                const count = ratingBreakdown[key] ?? 0;
                const percentage =
                  reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 lg:gap-3">
                    <span className="text-xs lg:text-sm text-primary-dark w-3 lg:w-4">
                      {star}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 lg:h-2">
                      <div
                        className="bg-primary h-1.5 lg:h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
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
              ? displayedReviews.length
              : showAllReviews
                ? baseReviews.length
                : Math.min(3, baseReviews.length)}{' '}
            of {baseReviews.length} reviews
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 lg:space-y-6">
        {initialLoading && (
          <div className="text-center py-12 text-primary/70">Loading reviews...</div>
        )}
        {!initialLoading && storeError && (
          <div className="text-center py-6 text-red-500">{storeError}</div>
        )}
        {!initialLoading && !storeError && displayedReviews.length === 0 && (
          <div className="text-center py-12 text-primary-dark text-lg">
            Be the first to review this product.
          </div>
        )}
        {displayedReviews.map(review => {
          const isNotHelpfulActive = Boolean(notHelpfulStates[review._id]);
          return (
            <div
              key={review._id}
              className="border-b border-primary/10 pb-4 lg:pb-6 last:border-b-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 lg:gap-4 mb-2 lg:mb-3">
                <div className="flex items-start gap-3">
                  <UserAvatar name={review.user?.name} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm lg:text-base">
                        {review.user?.name || 'Customer'}
                      </h4>
                      {review.verifiedPurchase ? (
                        <span className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-gray-100 text-gray-500 text-xs rounded-full flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1 lg:mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs lg:text-sm">
                        {review.title || 'Shared their experience'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-primary-dark">
                  {new Date(review.createdAt).toLocaleDateString()}
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
                          e => e.review._id === review._id && e.src === img
                        );
                        setLightboxEntries(allPhotoEntries);
                        setLightboxIndex(globalIndex >= 0 ? globalIndex : 0);
                        setIsLightboxOpen(true);
                      }}
                      className="relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-md border"
                      aria-label={`Open ${review.user?.name || 'customer'} photo ${idx + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`${review.user?.name || 'customer'} photo ${idx + 1}`}
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
                <button
                  className={`flex items-center gap-1 transition-colors ${review.viewerHasVoted
                    ? 'text-primary-dark font-medium'
                    : 'text-primary hover:text-primary-dark'
                    } disabled:opacity-50`}
                  onClick={() => handleHelpfulVote(review._id)}
                  disabled={
                    pendingHelpful?.id === review._id
                  }
                >
                  {pendingHelpful &&
                    pendingHelpful.id === review._id &&
                    pendingHelpful.source === 'helpful' ? (
                    <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className={`w-3 h-3 lg:w-4 lg:h-4 ${review.viewerHasVoted ? 'fill-current' : ''}`} />
                  )}
                  Helpful ({review.helpfulVotes ?? 0})
                </button>
                <button
                  className={`flex items-center gap-1 transition-colors ${isNotHelpfulActive
                    ? 'text-primary-dark font-medium'
                    : 'text-gray-500 hover:text-gray-600'
                    } disabled:opacity-40`}
                  onClick={() => handleNotHelpful(review._id)}
                  disabled={pendingHelpful?.id === review._id}
                >
                  {pendingHelpful &&
                    pendingHelpful.id === review._id &&
                    pendingHelpful.source === 'notHelpful' ? (
                    <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                  ) : (
                    <ThumbsDown
                      className={`w-3 h-3 lg:w-4 lg:h-4 ${isNotHelpfulActive ? 'fill-current' : ''}`}
                    />
                  )}
                  Not Helpful
                </button>
                <button
                  className="text-red-400 hover:text-primary-dark transition-colors"
                  onClick={() => {
                    setReportingReview(review);
                    setReportReason('spam');
                    setReportDetails('');
                  }}
                >
                  Report
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {baseReviews.length > 3 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-primary hover:text-primary-dark font-medium transition-colors text-sm lg:text-base"
          >
            {showAllReviews
              ? 'Show Less'
              : `Show All ${baseReviews.length} Reviews`}
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
                <UserAvatar
                  name={currentEntry.review.user?.name}
                  sizeClass="w-10 h-10"
                  dotSizeClass="w-2.5 h-2.5"
                  textSizeClass="text-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {currentEntry.review.user?.name || 'Customer'}
                    </span>
                    {currentEntry.review.verifiedPurchase && (
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
                {currentEntry.review.title || 'Shared experience'}
              </h4>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                {currentEntry.review.comment}
              </p>
              <div className="text-[11px] text-gray-500 mb-3">
                {new Date(currentEntry.review.createdAt).toLocaleDateString()}
              </div>

              {/* Thumbs for this review */}
              {currentEntry.review.images &&
                currentEntry.review.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {currentEntry.review.images.map((img, idx) => {
                      const globalIdx = allPhotoEntries.findIndex(
                        e =>
                          e.review._id === currentEntry.review._id &&
                          e.src === img
                      );
                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            setLightboxIndex(globalIdx >= 0 ? globalIdx : 0)
                          }
                          className={`relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-md border-2 ${lightboxIndex === globalIdx
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
                  {currentEntry.review.helpfulVotes ?? 0})
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

      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        productId={product.id}
        productName={product.name}
        onSubmitted={() => refreshReviews(product.id)}
      />
      <LoginPromptModal
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        action="review"
      />

      {reportingReview && (
        <div
          className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/70">Report review</p>
                <h3 className="text-lg font-semibold text-primary-dark">
                  {reportingReview.user?.name || 'Customer'}
                </h3>
              </div>
              <button
                onClick={() => setReportingReview(null)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close report modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary-dark">Select a reason</p>
                <div className="space-y-2">
                  {reportReasons.map(reason => (
                    <label
                      key={reason.id}
                      className="flex items-center gap-2 text-sm text-primary-dark cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={reason.id}
                        checked={reportReason === reason.id}
                        onChange={() => setReportReason(reason.id)}
                      />
                      {reason.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="report-notes" className="text-sm font-medium text-primary-dark">
                  Additional details (optional)
                </label>
                <textarea
                  id="report-notes"
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 min-h-[80px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Any extra context you’d like to share"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReportingReview(null)}
                  className="px-4 py-2 text-sm border border-primary/20 rounded-lg text-primary-dark hover:bg-primary/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-dark"
                >
                  Submit report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
