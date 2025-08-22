import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Search className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-semibold text-primary-dark mb-2">
            Product Not Found
          </h1>
          <p className="text-primary-dark/70">
            Sorry, the product you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>

          <div className="flex gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
