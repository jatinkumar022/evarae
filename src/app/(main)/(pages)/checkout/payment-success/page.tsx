'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Container from '@/app/(main)/components/layouts/Container';
import { CheckCircle, Package, Truck, Clock, AlertCircle, Download } from 'lucide-react';
import { InvoiceDownloadProgress } from '@/app/(main)/components/ui/InvoiceDownloadProgress';
import { downloadInvoiceWithProgress } from '@/app/(main)/utils/invoiceDownload';
import { useCartStore } from '@/lib/data/mainStore/cartStore';
import { useCartCountStore } from '@/lib/data/mainStore/cartCountStore';
import PageLoader from '@/app/(main)/components/layouts/PageLoader';
import ReturnRequestModal from '@/app/(main)/components/ui/ReturnRequestModal';
import Image from '@/app/(main)/components/ui/FallbackImage';

type OrderItem = {
  product: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
};

type SuccessOrder = {
  _id: string;
  orderNumber?: string;
  totalAmount?: number;
  paymentStatus?: string;
  paidAt?: string | null;
  items?: OrderItem[];
};

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<SuccessOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const loadCart = useCartStore(state => state.load);
  const syncCartCount = useCartCountStore(state => state.syncWithCart);

  useEffect(() => {
    // Ensure cart is cleared client-side after successful payment
    loadCart()
      .catch(() => {
        // Ignore errors – cart API will report auth issues if user logs out
      })
      .finally(() => {
        syncCartCount();
      });
  }, [loadCart, syncCartCount]);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      setIsLoading(true);
      fetch(`/api/orders/${orderId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch order details');
          }
          return res.json();
        })
        .then((data: { order?: SuccessOrder; error?: string }) => {
          if (data.error) {
            throw new Error(data.error);
          }
          if (data.order) {
            setOrderDetails(data.order);
          } else {
            throw new Error('Order not found');
          }
        })
        .catch(() => {
          setError('Unable to load order details');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const downloadInvoice = async () => {
    const key = orderDetails?.orderNumber || orderDetails?._id;
    if (!key) return;

    setShowProgress(true);
    setDownloadProgress(0);

    try {
      await downloadInvoiceWithProgress(key, (progress) => {
        setDownloadProgress(progress);
      });
      setTimeout(() => {
        setShowProgress(false);
        setDownloadProgress(0);
      }, 1500);
    } catch {
      setError('Unable to download invoice');
      setShowProgress(false);
      setDownloadProgress(0);
    }
  };

  // Show loader while fetching order details
  if (isLoading) {
    return (
      <>
        <PageLoader fullscreen showLogo />
        <ReturnRequestModal
          isOpen={false}
          onClose={() => { }}
          orderId=""
          orderItem={null}
        />
      </>
    );
  }

  return (
    <Container className="py-8 lg:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-4 sm:mb-6">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto" />
        </div>

        {/* Success Message */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-primary-dark mb-3 sm:mb-4 px-2">
          Payment Successful!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2">
          Thank you for your purchase. Your order has been confirmed and will be
          processed shortly.
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 mx-2 sm:mx-0">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Notice</span>
            </div>
            <p className="text-yellow-600 text-xs sm:text-sm mt-1 text-left">{error}</p>
          </div>
        )}

        {/* Order Details */}
        {orderDetails ? (
          <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 mx-2 sm:mx-0">
            <h2 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
              Order Details
            </h2>
            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center gap-2 sm:gap-4">
                <span className="text-gray-600 flex-shrink-0">Order Number:</span>
                <span className="font-medium text-dark text-right break-all sm:break-normal min-w-0">
                  {orderDetails.orderNumber || orderDetails._id}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 sm:gap-4">
                <span className="text-gray-600 flex-shrink-0">Total Amount:</span>
                <span className="font-medium text-accent text-right">
                  ₹{(orderDetails.totalAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 sm:gap-4">
                <span className="text-gray-600 flex-shrink-0">Payment Status:</span>
                <span className="font-medium text-green-600 capitalize text-right">
                  {orderDetails.paymentStatus || 'paid'}
                </span>
              </div>
            </div>

            {/* Order Items with Return Buttons */}
            {orderDetails.items && orderDetails.items.length > 0 && (
              <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-primary/10">
                <h3 className="text-sm sm:text-base font-semibold text-primary-dark mb-3 sm:mb-4 text-left">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/40 rounded-lg border border-primary/5"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary/60" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-start text-primary-dark text-sm sm:text-base mb-1">
                          {item.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-primary mt-1">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Invoice */}
            <div className="mt-4 sm:mt-5">
              <button
                onClick={downloadInvoice}
                className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium text-white bg-primary hover:bg-primary-dark transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="whitespace-nowrap">Download Invoice</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 mx-2 sm:mx-0">
            <h2 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
              Order Confirmed
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm text-left">
              Your payment has been processed successfully. You will receive an
              email confirmation shortly.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 mx-2 sm:mx-0">
          <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-3 sm:mb-4">
            What&apos;s Next?
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-dark text-left">
                Your order is being prepared for shipment
              </span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-dark text-left">
                You&apos;ll receive tracking information via email
              </span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-dark text-left">
                Estimated delivery: 2-4 business days
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center px-2 sm:px-0">
          <Link
            href="/orders/history"
            className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 text-center rounded-md font-medium text-white bg-primary hover:bg-primary-dark transition-colors duration-200 active:scale-[0.98] flex items-center justify-center"
          >
            View Order History
          </Link>
          <Link
            href="/all-jewellery"
            className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 text-center rounded-md font-medium text-primary border border-primary/40 hover:bg-primary hover:!text-white transition-colors duration-200 active:scale-[0.98] flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-600 px-2 sm:px-0">
          <p className="break-words">
            Need help? Contact our support team at{' '}
            <a
              href="mailto:support@caelvi.com"
              className="text-primary underline break-all"
            >
              support@caelvi.com
            </a>
          </p>
        </div>
      </div>

      {/* Invoice Download Progress Modal */}
      <InvoiceDownloadProgress
        isOpen={showProgress}
        onClose={() => {
          if (downloadProgress >= 100) {
            setShowProgress(false);
            setDownloadProgress(0);
          }
        }}
        progress={downloadProgress}
      />

      {/* Return Request Modal */}
      <ReturnRequestModal
        isOpen={returnModalOpen && !!selectedItem && !!orderDetails}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedItem(null);
        }}
        orderId={orderDetails?._id || ''}
        orderItem={selectedItem}
        onSuccess={() => {
          setReturnModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </Container>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <>
          <Container className="py-8">
            <div className="text-center">Loading...</div>
          </Container>
          <ReturnRequestModal
            isOpen={false}
            onClose={() => { }}
            orderId=""
            orderItem={null}
          />
        </>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}
