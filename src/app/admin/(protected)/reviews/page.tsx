'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Eye,
  Search,
  ShieldCheck,
  ShieldX,
  Star,
  Trash2,
  XCircle,
  Plus,
  MoreVertical,
  MessageSquare,
  X,
  Package,
} from 'lucide-react';
import { useReviewStore, AdminReview, ReviewStatus } from '@/lib/data/store/reviewStore';
import { useProductStore, Product } from '@/lib/data/store/productStore';
import { CustomSelect } from '@/app/admin/components/CustomSelect';
import Modal from '@/app/admin/components/Modal';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';

export default function AdminReviewsPage() {
  const {
    reviews,
    reviewType,
    filters,
    pagination,
    status,
    stats,
    setReviewType,
    setFilters,
    fetchReviews,
    fetchReview,
    fetchStats,
    updateReviewStatus,
    deleteReview,
    createFeaturedReviews,
  } = useReviewStore();

  const { products, fetchProducts, status: productStatus } = useProductStore();

  const router = useRouter();

  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reviewsJson, setReviewsJson] = useState('');
  const [isSubmittingFeatured, setIsSubmittingFeatured] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openFeaturedDropdownId, setOpenFeaturedDropdownId] = useState<string | null>(null);

  // Fetch products when featured tab is active
  useEffect(() => {
    if (reviewType === 'featured') {
      fetchProducts();
    }
  }, [reviewType, fetchProducts]);

  // Ensure products are available when modal opens
  useEffect(() => {
    if (isFeaturedModalOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isFeaturedModalOpen, products.length, fetchProducts]);

  // Fetch reviews when filters or reviewType changes
  useEffect(() => {
    setFilters({ limit: 12 });
  }, [setFilters]);

  useEffect(() => {
    fetchReviews();
  }, [filters, reviewType, fetchReviews]);

  useEffect(() => {
    if (reviewType === 'real') {
      fetchStats();
    }
  }, [reviewType, fetchStats]);

  const handleSearch = (search: string) => setFilters({ search, page: 1 });
  const handleStatusFilter = (status: string) => setFilters({ status, page: 1 });
  const handleSort = (sortBy: string) => {
    const currentSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters({ sortBy, sortOrder: currentSortOrder, page: 1 });
  };
  const handlePageChange = (page: number) => setFilters({ page });

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: reviewType === 'real' ? 'pending' : '',
      product: '',
      rating: '',
      verifiedPurchase: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    const defaultStatus = reviewType === 'real' ? 'pending' : '';
    return (
      filters.search !== '' ||
      filters.status !== defaultStatus ||
      filters.product !== '' ||
      filters.rating !== '' ||
      filters.verifiedPurchase !== '' ||
      filters.sortBy !== 'createdAt' ||
      filters.sortOrder !== 'desc'
    );
  }, [filters, reviewType]);

  const handleOpenFeaturedModal = (productId?: string) => {
    if (productId) {
      setSelectedProductId(productId);
    } else {
      setSelectedProductId('');
    }
    setIsFeaturedModalOpen(true);
  };

  const handleViewFeaturedReviewsPage = (productId: string) => {
    router.push(`/admin/reviews/featured/${productId}`);
  };

  const renderFeaturedProductCard = (product: Product) => {
    const coverImage = product.images?.[0];
    const isDropdownOpen = openFeaturedDropdownId === product._id;

    return (
      <div
        key={product._id}
        className="group relative bg-white dark:bg-[#1d1d1d] border border-gray-200 dark:border-[#525252] rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <button
              onClick={() => setOpenFeaturedDropdownId(isDropdownOpen ? null : product._id)}
              className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-[#525252] shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-[#1d1d1d]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#525252]"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenFeaturedDropdownId(null)}
                />
                <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-[#1d1d1d] ring-1 ring-black ring-opacity-5 z-20 border border-gray-200 dark:border-[#525252]">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setOpenFeaturedDropdownId(null);
                        handleViewFeaturedReviewsPage(product._id);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252525]"
                    >
                      <Eye className="h-4 w-4" />
                      View Reviews
                    </button>
                    <button
                      onClick={() => {
                        setOpenFeaturedDropdownId(null);
                        handleOpenFeaturedModal(product._id);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      <Plus className="h-4 w-4" />
                      Add Reviews
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-[#2c2c2c] relative">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Package className="h-10 w-10 text-gray-400 dark:text-[#888]" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
              {product.name}
            </h3>
            {product.sku && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {product.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.categories.slice(0, 3).map(category => (
                <span
                  key={category._id}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-[#2f2f2f] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#404040]"
                >
                  {category.name}
                </span>
              ))}
              {product.categories.length > 3 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-[#2f2f2f] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#404040]">
                  +{product.categories.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {product.reviewsCount ?? 0} review{(product.reviewsCount ?? 0) === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium text-gray-900 dark:text-white">
                {(product.rating ?? 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleStatusUpdate = async (reviewId: string, nextStatus: ReviewStatus) => {
    setActionLoading(reviewId);
    try {
      await updateReviewStatus(reviewId, nextStatus);
      toastApi.success('Review updated', `Review status changed to ${nextStatus}`);
      fetchReviews();
      if (reviewType === 'real') {
        fetchStats();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update review';
      toastApi.error('Action failed', message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (review: AdminReview) => {
    if (!confirm('Delete this review permanently?')) return;
    setActionLoading(review._id);
    try {
      await deleteReview(review._id);
      toastApi.success('Review deleted', 'The review has been removed');
      fetchReviews();
      if (reviewType === 'real') {
        fetchStats();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete review';
      toastApi.error('Delete failed', message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewReview = async (review: AdminReview) => {
    try {
      await fetchReview(review._id);
      setSelectedReview(review);
    } catch {
      toastApi.error('Failed to load review', 'Please try again');
    }
  };

  const handleAddFeaturedReviews = async () => {
    if (!selectedProductId) {
      toastApi.error('Please select a product');
      return;
    }

    if (!reviewsJson.trim()) {
      toastApi.error('Please provide reviews JSON');
      return;
    }

    let parsedReviews;
    try {
      parsedReviews = JSON.parse(reviewsJson);
    } catch {
      toastApi.error('Invalid JSON format');
      return;
    }

    if (!Array.isArray(parsedReviews) || parsedReviews.length === 0) {
      toastApi.error('Reviews must be a non-empty array');
      return;
    }

    setIsSubmittingFeatured(true);
    try {
      const result = await createFeaturedReviews(selectedProductId, parsedReviews);
      const failedCount = result.errors?.length ?? 0;
      toastApi.success(
        `Created ${result.created?.length || 0} featured review(s)`,
        failedCount > 0 ? `${failedCount} review(s) failed` : undefined
      );
      setIsFeaturedModalOpen(false);
      setSelectedProductId('');
      setReviewsJson('');
      fetchReviews();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create featured reviews';
      toastApi.error('Action failed', message);
    } finally {
      setIsSubmittingFeatured(false);
    }
  };

  const renderReviewCard = (review: AdminReview) => {
    const reviewStatus = review.status ?? 'pending';
    const isDropdownOpen = openDropdownId === review._id;

    return (
      <div
        key={review._id}
        className="group relative bg-white dark:bg-[#1d1d1d] border border-gray-200 dark:border-[#525252] rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Action Dropdown */}
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <button
              onClick={() => setOpenDropdownId(isDropdownOpen ? null : review._id)}
              className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-[#525252] shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-[#1d1d1d]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#525252]"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenDropdownId(null)}
                />
                <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white dark:bg-[#1d1d1d] ring-1 ring-black ring-opacity-5 z-20 border border-gray-200 dark:border-[#525252]">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setOpenDropdownId(null);
                        handleViewReview(review);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#525252]"
                    >
                      <Eye className="h-4 w-4 mr-2" /> View
                    </button>
                    {reviewType === 'real' && reviewStatus !== 'approved' && (
                      <button
                        onClick={() => {
                          setOpenDropdownId(null);
                          handleStatusUpdate(review._id, 'approved');
                        }}
                        disabled={actionLoading === review._id}
                        className="w-full flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                      </button>
                    )}
                    {reviewType === 'real' && reviewStatus !== 'rejected' && (
                      <button
                        onClick={() => {
                          setOpenDropdownId(null);
                          handleStatusUpdate(review._id, 'rejected');
                        }}
                        disabled={actionLoading === review._id}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setOpenDropdownId(null);
                        handleDelete(review);
                      }}
                      disabled={actionLoading === review._id}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Review Content */}
        <div className="p-4">
          {/* Product Info */}
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {review.product?.name || 'Unknown Product'}
            </h3>
            {review.title && (
              <p className="text-xs text-gray-500 dark:text-[#bdbdbd] truncate mt-1">
                {review.title}
              </p>
            )}
          </div>

          {/* Rating & Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {review.rating}
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${reviewStatus === 'approved'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : reviewStatus === 'rejected'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                }`}
            >
              {reviewStatus}
            </span>
          </div>

          {/* Customer Info */}
          <div className="mb-3">
            <p className="text-sm text-gray-900 dark:text-white">
              {review.user?.name || 'Customer'}
            </p>
            {review.user?.email && (
              <p className="text-xs text-gray-500 dark:text-[#bdbdbd] truncate">
                {review.user.email}
              </p>
            )}
          </div>

          {/* Comment Preview */}
          {review.comment && (
            <p className="text-xs text-gray-600 dark:text-[#bdbdbd] line-clamp-2 mb-3">
              {review.comment}
            </p>
          )}

          {/* Verified Purchase Badge */}
          <div className="flex items-center justify-between">
            {review.verifiedPurchase ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <ShieldCheck className="w-3 h-3" />
                Verified Purchase
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-[#bdbdbd]">
                <ShieldX className="w-3 h-3" />
                Unverified
              </span>
            )}
            {review.helpfulVotes !== undefined && (
              <span className="text-xs text-gray-500 dark:text-[#bdbdbd]">
                {review.helpfulVotes} helpful
              </span>
            )}
          </div>

          {/* Images Preview */}
          {review.images && review.images.length > 0 && (
            <div className="mt-3 flex gap-2">
              {review.images.slice(0, 3).map((img, idx) => (
                <div key={idx} className="relative w-12 h-12 rounded overflow-hidden bg-gray-200 dark:bg-[#525252]">
                  <Image
                    src={img}
                    alt={`Review image ${idx + 1}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ))}
              {review.images.length > 3 && (
                <div className="w-12 h-12 rounded bg-gray-100 dark:bg-[#525252] flex items-center justify-center text-xs text-gray-500 dark:text-[#bdbdbd]">
                  +{review.images.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Date */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#525252]">
            <p className="text-xs text-gray-500 dark:text-[#bdbdbd]">
              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex md:items-center gap-4 flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Reviews</h1>
          <p className="text-gray-600 dark:text-[#bdbdbd]">
            {reviewType === 'real'
              ? 'Approve authentic reviews and keep spam away'
              : 'Manage featured reviews for products'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {reviewType === 'featured' && (
            <button
              onClick={() => handleOpenFeaturedModal()}
              className="inline-flex items-center text-xs md:text-sm px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Featured Reviews
            </button>
          )}
        </div>
      </div>

      {/* Review Type Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-[#525252]">
        <button
          onClick={() => {
            setReviewType('real');
            setFilters({ status: 'pending', page: 1 });
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${reviewType === 'real'
            ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          Real Reviews
        </button>
        <button
          onClick={() => {
            setReviewType('featured');
            setFilters({ status: '', page: 1 });
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${reviewType === 'featured'
            ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          Featured Reviews
        </button>
      </div>

      {reviewType === 'real' ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-primary-200 dark:border-primary-800 p-4 bg-white dark:bg-[#1d1d1d]">
              <p className="text-xs uppercase text-primary-600 dark:text-primary-400">Pending</p>
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1">Waiting for review</p>
            </div>
            <div className="rounded-lg border border-green-200 dark:border-green-800 p-4 bg-white dark:bg-[#1d1d1d]">
              <p className="text-xs uppercase text-green-600 dark:text-green-400">Approved</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {stats.approved}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1">Visible on storefront</p>
            </div>
            <div className="rounded-lg border border-red-200 dark:border-red-800 p-4 bg-white dark:bg-[#1d1d1d]">
              <p className="text-xs uppercase text-red-600 dark:text-red-400">Rejected</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {stats.rejected}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1">Flagged or spam</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#191919] shadow rounded-lg p-6 border border-gray-200 dark:border-[#525252]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <div className="mt-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by comment, title, or customer name..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md sm:text-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600"
                  />
                </div>
              </div>

              <div>
                <CustomSelect
                  label="Status"
                  value={filters.status}
                  onChange={(v) => handleStatusFilter(v)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                />
              </div>

              <div>
                <CustomSelect
                  label="Sort By"
                  value={filters.sortBy}
                  onChange={(v) => handleSort(v)}
                  options={[
                    { value: 'createdAt', label: 'Date Created' },
                    { value: 'rating', label: 'Rating' },
                    { value: 'helpfulVotes', label: 'Helpful Votes' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
            <div className="px-4 py-5 sm:p-6">
              {status === 'loading' ? (
                <div className="text-center py-12">
                  <InlineSpinner size="lg" className="mx-auto mb-4" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No reviews found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {reviews.map(renderReviewCard)}
                </div>
              )}

              {/* Pagination */}
              {status !== 'loading' && pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252]">
          <div className="px-4 py-5 sm:p-6">
            {productStatus === 'loading' ? (
              <div className="text-center py-12">
                <InlineSpinner size="lg" className="mx-auto mb-4" />
                <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
                  Start by adding a product to manage featured reviews.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(renderFeaturedProductCard)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Review Modal */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Product</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {selectedReview.product?.name || 'Unknown product'}
              </p>
              {selectedReview.product?.slug && (
                <Link
                  href={`/product/${selectedReview.product.slug}`}
                  target="_blank"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View Product →
                </Link>
              )}
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Customer</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedReview.user?.name || 'Customer'}
                </p>
                {selectedReview.user?.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedReview.user.email}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Rating</p>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{selectedReview.rating}</span>
                </div>
              </div>
            </div>
            {selectedReview.title && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase mb-1">Title</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedReview.title}
                </p>
              </div>
            )}
            {selectedReview.comment && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase mb-1">Comment</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedReview.comment}
                </p>
              </div>
            )}
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase mb-2">Images</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedReview.images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-[#525252]">
                      <Image
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-[#525252]">
              {selectedReview.verifiedPurchase ? (
                <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Purchase
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-[#bdbdbd]">
                  <ShieldX className="w-4 h-4" />
                  Unverified
                </span>
              )}
              {selectedReview.helpfulVotes !== undefined && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedReview.helpfulVotes} helpful votes
                </span>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Featured Reviews Modal */}
      <Modal
        isOpen={isFeaturedModalOpen}
        onClose={() => {
          setIsFeaturedModalOpen(false);
          setSelectedProductId('');
          setReviewsJson('');
        }}
        title="Add Featured Reviews"
        size="lg"
        footer={
          <>
            <button
              onClick={handleAddFeaturedReviews}
              disabled={isSubmittingFeatured || !selectedProductId || !reviewsJson.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingFeatured ? (
                <>
                  <InlineSpinner size="sm" />
                  Creating...
                </>
              ) : (
                'Create Reviews'
              )}
            </button>
            <button
              onClick={() => {
                setIsFeaturedModalOpen(false);
                setSelectedProductId('');
                setReviewsJson('');
              }}
              disabled={isSubmittingFeatured}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-[#525252] shadow-sm px-4 py-2 bg-white dark:bg-[#242424] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 dark:border-[#525252] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reviews JSON *
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Paste an array of review objects. Each review should have: fullName, title, rating,
              comment, featuredVotes (optional), verifiedPurchase (optional), createdAt (optional)
            </p>
            <textarea
              value={reviewsJson}
              onChange={(e) => setReviewsJson(e.target.value)}
              placeholder={`[\n  {\n    "fullName": "Jinal Kapadia",\n    "title": "Love everything about it",\n    "rating": 5,\n    "comment": "I love everything about this jewelry!",\n    "featuredVotes": 95,\n    "verifiedPurchase": true,\n    "createdAt": "2025-09-08T15:45:00.000Z"\n  }\n]`}
              className="w-full border border-gray-300 dark:border-[#525252] rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-[#242424] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 min-h-[300px]"
              spellCheck={false}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">Note:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All featured reviews will be auto-approved</li>
              <li>Each review will be created as a separate entry</li>
              <li>Featured reviews won&apos;t have a real user account</li>
              <li>Product rating will be updated automatically</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
