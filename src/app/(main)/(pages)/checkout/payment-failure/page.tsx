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
    <Container className="py-8 lg:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-4 sm:mb-6">
          <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mx-auto" />
        </div>

        {/* Error Message */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-primary-dark mb-3 sm:mb-4 px-2">
          Payment Failed
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-2 px-2">{error}</p>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2">
          Don&apos;t worry, no charges have been made to your account.
        </p>

        {/* Common Reasons */}
        <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 text-left mx-2 sm:mx-0">
          <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
            Common reasons for payment failure:
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li>• Insufficient funds in your account</li>
            <li>• Incorrect card details entered</li>
            <li>• Card expired or blocked by your bank</li>
            <li>• Network connectivity issues</li>
            <li>• Bank&apos;s security measures</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center px-2 sm:px-0">
          <Link
            href="/checkout"
            className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 text-center rounded-md font-medium text-white bg-primary hover:bg-primary-dark transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="whitespace-nowrap">Try Again</span>
          </Link>
          <Link
            href="/cart"
            className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 text-center rounded-md font-medium text-primary border border-primary/40 hover:bg-primary hover:!text-white transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="whitespace-nowrap">Back to Cart</span>
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-600 px-2 sm:px-0">
          <p className="break-words">
            Still having trouble? Contact our support team at{' '}
            <a
              href="mailto:support@caelvi.com"
              className="text-primary underline break-all"
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
