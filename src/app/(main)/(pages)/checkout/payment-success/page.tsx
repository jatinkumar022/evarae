'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Container from '@/app/(main)/components/layouts/Container';
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';

type SuccessOrder = {
  _id: string;
  orderNumber?: string;
  totalAmount?: number;
  paymentStatus?: string;
};

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<SuccessOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch order details');
          }
          return res.json();
        })
        .then((data: SuccessOrder) => {
          setOrderDetails(data);
          // Global loader will handle loading state
        })
        .catch(() => {
          setError('Unable to load order details');
          // Global loader will handle loading state
        });
    }
    // Global loader will handle loading state
  }, [searchParams]);

  const downloadInvoice = async () => {
    try {
      const key = orderDetails?.orderNumber || orderDetails?._id;
      if (!key) return;
      const res = await fetch(`/api/orders/${key}/invoice`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${key}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Unable to download invoice');
    }
  };

  // Global loader will handle loading state

  return (
    <Container className="py-8 md:py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
          Payment Successful!
        </h1>
        <p className="text-primary-dark/70 mb-8">
          Thank you for your purchase. Your order has been confirmed and will be
          processed shortly.
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Notice</span>
            </div>
            <p className="text-yellow-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Order Details */}
        {orderDetails ? (
          <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-primary-dark mb-4">
              Order Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-dark/70">Order Number:</span>
                <span className="font-medium">
                  {orderDetails.orderNumber || orderDetails._id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-dark/70">Total Amount:</span>
                <span className="font-medium text-accent">
                  ₹{(orderDetails.totalAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-dark/70">Payment Status:</span>
                <span className="font-medium text-green-600 capitalize">
                  {orderDetails.paymentStatus || 'paid'}
                </span>
              </div>
            </div>

            {/* Download Invoice */}
            <div className="mt-5">
              <button
                onClick={downloadInvoice}
                className="btn btn-filled btn-animated"
              >
                <Download className="w-4 h-4 mr-2" /> Download Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-primary-dark mb-4">
              Order Confirmed
            </h2>
            <p className="text-primary-dark/70 text-sm">
              Your payment has been processed successfully. You will receive an
              email confirmation shortly.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-primary-dark mb-4">
            What&apos;s Next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-primary-dark">
                Your order is being prepared for shipment
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-primary-dark">
                You&apos;ll receive tracking information via email
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-primary-dark">
                Estimated delivery: 2-4 business days
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/orders/history" className="btn btn-filled btn-animated">
            View Order History
          </Link>
          <Link
            href="/all-jewellery"
            className="btn btn-outline btn-animated hover:!text-primary"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-sm text-primary-dark/70">
          <p>
            Need help? Contact our support team at{' '}
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

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <div className="text-center">Loading...</div>
        </Container>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}
