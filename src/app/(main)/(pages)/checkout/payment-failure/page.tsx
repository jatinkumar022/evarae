'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Container from '@/app/(main)/components/layouts/Container';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

function FailureInner() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorCode = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorCode) {
      setError(errorDescription || 'Payment failed. Please try again.');
    } else {
      setError('Payment was not completed. Please try again.');
    }
  }, [searchParams]);

  return (
    <Container className="py-8 md:py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
          Payment Failed
        </h1>
        <p className="text-primary-dark/70 mb-2">{error}</p>
        <p className="text-primary-dark/70 mb-8">
          Don&apos;t worry, no charges have been made to your account.
        </p>

        {/* Common Reasons */}
        <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-primary-dark mb-4">
            Common reasons for payment failure:
          </h3>
          <ul className="space-y-2 text-sm text-primary-dark/70">
            <li>• Insufficient funds in your account</li>
            <li>• Incorrect card details entered</li>
            <li>• Card expired or blocked by your bank</li>
            <li>• Network connectivity issues</li>
            <li>• Bank&apos;s security measures</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/checkout"
            className="btn btn-filled btn-animated flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
          <Link
            href="/cart"
            className="btn btn-outline btn-animated flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-sm text-primary-dark/70">
          <p>
            Still having trouble? Contact our support team at{' '}
            <a
              href="mailto:support@caelvi.com"
              className="text-primary underline"
            >
              support@caelvi.com
            </a>
          </p>
        </div>
      </div>
    </Container>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8 md:py-12">
          <div className="max-w-2xl mx-auto text-center">Loading...</div>
        </Container>
      }
    >
      <FailureInner />
    </Suspense>
  );
}
