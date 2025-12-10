'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  AlertCircle,
} from 'lucide-react';
import CustomDropdown from '@/app/(main)/components/ui/customDropdown';
import Image from '@/app/(main)/components/ui/FallbackImage';
import toastApi from '@/lib/toast';
import Container from '@/app/(main)/components/layouts/Container';
import Link from 'next/link';
import PageLoader from '@/app/(main)/components/layouts/PageLoader';
import { useReturnRequestStore, ReturnRequest } from '@/lib/data/store/returnRequestStore';
import { motion } from 'framer-motion';

const ReturnStatus = ({ status }: { status: ReturnRequest['status'] }) => {
  const statusConfig: Record<
    ReturnRequest['status'],
    { color: string; icon: React.ElementType; label: string }
  > = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: Clock,
      label: 'Pending',
    },
    approved: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle2,
      label: 'Approved',
    },
    rejected: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: XCircle,
      label: 'Rejected',
    },
    processing: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: RotateCcw,
      label: 'Processing',
    },
    completed: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle2,
      label: 'Completed',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

const RETURN_REASON_LABELS: Record<string, string> = {
  defective: 'Defective Product',
  wrong_item: 'Wrong Item Received',
  quality_issue: 'Quality Issue',
  not_as_described: 'Not as Described',
  damaged: 'Damaged During Shipping',
  other: 'Other',
};

export default function ReturnsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { returnRequests, status, error, fetchReturnRequests } = useReturnRequestStore();

  // Ensure this page always starts at the top
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  // Load return requests on mount
  useEffect(() => {
    if (status === 'idle') {
      fetchReturnRequests();
    }
  }, [status, fetchReturnRequests]);

  // Show error if fetch failed
  useEffect(() => {
    if (status === 'error' && error) {
      toastApi.error('Unable to load return requests. Please try again later');
    }
  }, [status, error]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const filteredReturnRequests = useMemo(() => {
    return returnRequests.filter(request => {
      const matchesSearch =
        request.order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.orderItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.orderItem.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returnRequests, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Show loader while fetching
  if (status === 'loading') {
    return (
      <div className="h-screen overflow-hidden">
        <PageLoader fullscreen showLogo />
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Container className="py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-heading mb-2">
            Returns & Refunds
          </h1>
          <p className="text-primary-dark">Track and manage your return requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-primary/20 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/60" />
                <input
                  type="text"
                  placeholder="Search by order number, product name, or SKU..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-primary/20 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors dark:bg-[#242424] dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              className="w-full sm:w-40"
            />
          </div>
        </div>

        {/* Return Requests List */}
        <div className="space-y-4">
          {error && status === 'error' ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                Unable to load return details
              </h3>
              <p className="text-primary-dark mb-6">
                {error || 'Please try again later'}
              </p>
              <button
                onClick={() => fetchReturnRequests()}
                className="btn btn-filled"
              >
                Try Again
              </button>
            </div>
          ) : filteredReturnRequests.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-primary/20 shadow-sm p-12 text-center">
              <RotateCcw className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                No Return Requests Found
              </h3>
              <p className="text-primary-dark mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : "You haven't submitted any return requests yet."}
              </p>
              <Link href="/orders/history" className="btn btn-filled">
                View Orders
              </Link>
            </div>
          ) : (
            filteredReturnRequests.map(request => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-primary/20 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                        <RotateCcw className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-heading font-semibold text-heading">
                            Return Request #{request._id.slice(-8).toUpperCase()}
                          </h3>
                          <ReturnStatus status={request.status} />
                        </div>
                        <p className="text-sm text-primary-dark">
                          Order: {request.order.orderNumber || request.order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-primary-dark/70 mt-1">
                          Requested on {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/orders/${request.order._id}`}
                      className="btn btn-outline flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Order
                    </Link>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-[#242424] rounded-xl mb-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={request.orderItem.image || '/placeholder-product.png'}
                        alt={request.orderItem.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-heading mb-1 truncate">
                        {request.orderItem.name}
                      </h4>
                      <p className="text-sm text-primary-dark mb-2">
                        SKU: {request.orderItem.sku}
                      </p>
                      <p className="text-sm font-medium text-heading">
                        {formatCurrency(request.orderItem.price)} × {request.orderItem.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Return Details */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-heading mb-1">Return Reason</p>
                      <p className="text-sm text-primary-dark">
                        {RETURN_REASON_LABELS[request.returnReason] || request.returnReason}
                      </p>
                    </div>
                    {request.note && (
                      <div>
                        <p className="text-sm font-medium text-heading mb-1">Notes</p>
                        <p className="text-sm text-primary-dark">{request.note}</p>
                      </div>
                    )}
                    {request.adminNotes && (
                      <div>
                        <p className="text-sm font-medium text-heading mb-1">Admin Notes</p>
                        <p className="text-sm text-primary-dark">{request.adminNotes}</p>
                      </div>
                    )}
                    {request.processedAt && (
                      <div>
                        <p className="text-sm font-medium text-heading mb-1">Processed On</p>
                        <p className="text-sm text-primary-dark">
                          {formatDate(request.processedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Container>
    </main>
  );
}

