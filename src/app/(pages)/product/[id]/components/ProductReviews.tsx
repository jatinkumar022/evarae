'use client';
import { useState } from 'react';
import { Product } from '@/lib/types/product';
import {
  Star,
  StarHalf,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import CustomSelect from '@/app/components/filters/CustomSelect';

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

export function ProductReviews({ product }: ProductReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

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

  const displayedReviews = showAllReviews
    ? mockReviews
    : mockReviews.slice(0, 3);

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
        <button className="bg-primary text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm lg:text-base self-start sm:self-auto">
          <MessageCircle className="w-3 h-3 lg:w-4 lg:h-4" />
          Write a Review
        </button>
      </div>

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

      {/* Sort Options */}
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

        <span className="text-xs lg:text-sm text-primary-dark">
          Showing {displayedReviews.length} of {mockReviews.length} reviews
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 lg:space-y-6">
        {displayedReviews.map(review => (
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
    </div>
  );
}
