'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  ShieldX,
  Star,
} from 'lucide-react';
import InlineSpinner from '@/app/admin/components/InlineSpinner';
import { useProductStore } from '@/lib/data/store/productStore';
import { useFeaturedReviewStore } from '@/lib/data/store/featuredReviewStore';

export default function FeaturedReviewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;

  const {
    products,
    currentProduct,
    fetchProduct,
    status: productStatus,
  } = useProductStore();

  const featuredEntries = useFeaturedReviewStore(state => state.entries);
  const fetchFeaturedReviews = useFeaturedReviewStore(state => state.fetchFeaturedReviews);

  const featuredEntry = featuredEntries[productId];
  const featuredReviews = useMemo(
    () => featuredEntry?.reviews ?? [],
    [featuredEntry?.reviews]
  );
  const featuredStatus = featuredEntry?.status ?? 'idle';
  const featuredError = featuredEntry?.error ?? null;

  const [productError, setProductError] = useState<string | null>(null);

  const productFromStore = useMemo(() => {
    if (!productId) return null;
    return (
      products.find(p => p._id === productId) ||
      (currentProduct?._id === productId ? currentProduct : null)
    );
  }, [products, currentProduct, productId]);

  useEffect(() => {
    if (!productId) return;
    if (!productFromStore) {
      fetchProduct(productId).catch(err => {
        const message = err instanceof Error ? err.message : 'Unable to load product details';
        setProductError(message);
      });
    } else {
      setProductError(null);
    }
  }, [productId, productFromStore, fetchProduct]);

  useEffect(() => {
    if (!productId) return;
    fetchFeaturedReviews(productId);
  }, [productId, fetchFeaturedReviews]);

  const product = productFromStore ?? null;

  const productLoading = !product && productStatus === 'loading';

  const reviewCount = featuredReviews.length;
  const averageRating = useMemo(() => {
    if (reviewCount === 0) return 0;
    const total = featuredReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviewCount;
  }, [featuredReviews, reviewCount]);

  return (
    <section className="space-y-6 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <button
        onClick={() => router.push('/admin/reviews')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reviews
      </button>

      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
        {productLoading ? (
          <div className="flex items-center justify-center py-16">
            <InlineSpinner size="lg" />
          </div>
        ) : product ? (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-gray-100 dark:bg-[#2a2a2a] relative min-h-[220px]">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {product.name}
                  </h1>
                  {product.sku && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      SKU: {product.sku}
                    </p>
                  )}
                </div>
                <Link
                  href={`/product/${product.slug ?? product._id}`}
                  target="_blank"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View product →
                </Link>
              </div>

              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.categories.map(category => (
                    <span
                      key={category._id}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-[#2f2f2f] text-gray-700 dark:text-gray-300"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-8 text-sm">
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Featured Reviews</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{reviewCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Avg. Rating</p>
                  <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">All Reviews</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {product.reviewsCount ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-red-500">
            {productError || 'Product not found'}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Featured Reviews ({reviewCount})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                These reviews are manually curated and always approved.
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/reviews?tab=featured')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary-500 text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-sm max-sm:w-full max-sm:justify-center max-sm:mt-3"
            >
              Manage Featured Reviews
            </button>
          </div>

          {featuredStatus === 'loading' ? (
            <div className="text-center py-12">
              <InlineSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading featured reviews...</p>
            </div>
          ) : featuredError ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-500">{featuredError}</p>
            </div>
          ) : featuredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No featured reviews yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
                Use the “Manage Featured Reviews” button to add curated reviews for this product.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {featuredReviews.map(review => (
                <div
                  key={review._id}
                  className="rounded-lg border border-gray-200 dark:border-[#2f2f2f] p-4 bg-white dark:bg-[#101010]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {review.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {review.user?.name || 'Customer'}
                        </span>
                      </div>
                      {review.title && (
                        <p className="mt-1 font-medium text-gray-900 dark:text-white">{review.title}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {review.comment}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        {review.verifiedPurchase ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">Verified</span>
                          </>
                        ) : (
                          <>
                            <ShieldX className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Unverified</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {review.images && review.images.length > 0 && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2f2f2f]">
                          <Image src={img} alt="Review image" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Helpful votes:{' '}
                      <strong className="text-gray-900 dark:text-white">
                        {review.helpfulVotes ?? 0}
                      </strong>
                    </span>
                    {typeof review.featuredVotes === 'number' && (
                      <span>
                        Featured boost:{' '}
                        <strong className="text-gray-900 dark:text-white">
                          {review.featuredVotes}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

