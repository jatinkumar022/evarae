'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Star, X, Upload, Trash2, Loader2 } from 'lucide-react';
import toastApi from '@/lib/toast';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onSubmitted?: () => void;
}

type RatingOption = 1 | 2 | 3 | 4 | 5;

const ratingLabels: Record<RatingOption, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

export default function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  onSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<RatingOption | null>(null);
  const [hoverRating, setHoverRating] = useState<RatingOption | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      setRating(null);
      setHoverRating(null);
      setTitle('');
      setComment('');
      setImages([]);
      setIsSubmitting(false);
      setUploading(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    scrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.setProperty('overflow', 'hidden', 'important');
    document.body.style.setProperty('position', 'fixed', 'important');
    document.body.style.setProperty('width', '100%', 'important');
    document.body.style.setProperty('top', `-${scrollYRef.current}px`, 'important');
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('width');
      document.body.style.removeProperty('top');
      document.documentElement.style.removeProperty('overflow');
      window.scrollTo(0, scrollYRef.current);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const disabled = useMemo(() => {
    return (
      !rating ||
      comment.trim().length < 10 ||
      title.trim().length === 0 ||
      isSubmitting ||
      uploading
    );
  }, [rating, comment, title, isSubmitting, uploading]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setError(null);

    const remainingSlots = Math.max(0, 4 - images.length);
    if (remainingSlots === 0) {
      setError('You can upload up to 4 images.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);
    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Upload failed');
        }

        const data = (await res.json()) as { url: string };
        setImages(prev => [...prev, data.url]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      toastApi.error('Image upload failed', message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !rating) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/products/${encodeURIComponent(productId)}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            title: title.trim(),
            comment: comment.trim(),
            images,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      toastApi.success('Review submitted', 'We will publish it after approval.');
      onSubmitted?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      setError(message);
      toastApi.error('Unable to submit review', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col max-h-[95vh]"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary/70">
              Review
            </p>
            <h2
              id="write-review-title"
              className="text-lg sm:text-xl font-semibold text-primary-dark"
            >
              Share your thoughts about {productName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <form
            id="write-review-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-primary-dark">
                Overall rating
              </label>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {[1, 2, 3, 4, 5].map(value => {
                  const typed = value as RatingOption;
                  const active = hoverRating
                    ? typed <= hoverRating
                    : rating
                      ? typed <= rating
                      : false;
                  return (
                    <button
                      type="button"
                      key={value}
                      className="focus:outline-none"
                      onMouseEnter={() => setHoverRating(typed)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(typed)}
                      aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-7 h-7 ${active ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          } transition-transform ${active ? 'scale-110' : ''}`}
                      />
                    </button>
                  );
                })}
                <span className="text-sm text-primary/80">
                  {rating ? ratingLabels[rating] : 'Select rating'}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="review-title" className="text-sm font-medium text-primary-dark">
                Review title
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Great craftsmanship and design"
                className="mt-2 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={120}
              />
            </div>

            <div>
              <label htmlFor="review-comment" className="text-sm font-medium text-primary-dark">
                Your review
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell other shoppers about the sizing, quality, shine, comfort..."
                className="mt-2 w-full border rounded-lg px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={2000}
              />
              <div className="text-xs text-primary/60 text-right mt-1">
                {comment.length}/2000 characters
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-primary-dark">
                  Add photos (optional)
                </label>
                <span className="text-xs text-primary/60">Up to 4 images</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/20"
                  >
                    <img
                      src={img}
                      alt={`Uploaded review ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-white/95 shadow rounded-full p-1.5 text-[#ca2b2b]"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {images.length < 4 && (
                  <label className="w-20 h-20 border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center text-xs text-primary/70 cursor-pointer hover:border-primary/60 transition-colors">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mb-1" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mb-1" />
                        Add
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-3 text-xs text-primary/80 space-y-1">
              <p>
                • Reviews are published after a quick moderation to keep the community helpful.
              </p>
              <p>
                • Verified purchases show a badge automatically when we detect an order containing this product.
              </p>
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="border-t bg-white px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-primary/20 rounded-lg text-primary-dark hover:bg-primary/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="write-review-form"
            disabled={disabled}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

