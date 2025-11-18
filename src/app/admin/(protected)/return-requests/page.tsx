'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Eye,
} from 'lucide-react';
import { CustomSelect } from '@/app/admin/components/CustomSelect';
import { toastApi } from '@/lib/toast';
import InlineSpinner from '@/app/admin/components/InlineSpinner';
import Image from 'next/image';
import Link from 'next/link';

type ReturnRequest = {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
  };
  order: {
    _id: string;
    orderNumber?: string;
    totalAmount?: number;
    paidAt?: string;
  };
  orderItem: {
    product: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    quantity: number;
    image: string | null;
  };
  returnReason: string;
  note: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  adminNotes: string | null;
  processedAt: string | null;
  processedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

const RETURN_REASON_LABELS: Record<string, string> = {
  defective: 'Defective Product',
  wrong_item: 'Wrong Item Received',
  quality_issue: 'Quality Issue',
  not_as_described: 'Not as Described',
  damaged: 'Damaged During Shipping',
  other: 'Other',
};

export default function ReturnRequestsPage() {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchReturnRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const res = await fetch(`/api/admin/return-requests?${params.toString()}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch return requests');
      }

      const data = await res.json();
      setReturnRequests(data.returnRequests || []);
      setPagination(prev => data.pagination || prev);
    } catch (error) {
      console.error('Error fetching return requests:', error);
      toastApi.error('Failed to load return requests', 'Please try again');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchReturnRequests();
  }, [fetchReturnRequests]);


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

  const getStatusBadge = (status: ReturnRequest['status']) => {
    const config = {
      pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        icon: Clock,
      },
      approved: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        icon: CheckCircle,
      },
      rejected: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        icon: XCircle,
      },
      processing: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        icon: Package,
      },
      completed: {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-800 dark:text-gray-300',
        icon: CheckCircle,
      },
    };

    const statusConfig = config[status] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        <span className="hidden sm:inline">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </span>
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Return Requests
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage product return requests from customers
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Filter by status"
            className="w-48"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {['pending', 'approved', 'rejected', 'processing', 'completed'].map((status) => {
          const count = returnRequests.filter((r) => r.status === status).length;
          return (
            <div
              key={status}
              className="bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#3a3a3a] rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {status}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {count}
                  </p>
                </div>
                <RotateCcw className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Return Requests List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <InlineSpinner />
        </div>
      ) : returnRequests.length === 0 ? (
        <div className="bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#3a3a3a] rounded-lg p-12 text-center">
          <RotateCcw className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No return requests found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#3a3a3a] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-[#3a3a3a]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Reason
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#191919] divide-y divide-gray-200 dark:divide-[#3a3a3a]">
                {returnRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        #{request._id.slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Order: {request.order.orderNumber || request.order._id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-xs sm:text-sm text-gray-900 dark:text-white break-words">
                        {request.user.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                        {request.user.email}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {request.orderItem.image ? (
                          <Image
                            src={request.orderItem.image}
                            alt={request.orderItem.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-[#3a3a3a] rounded-md flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {request.orderItem.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {request.orderItem.quantity} •{' '}
                            {formatCurrency(request.orderItem.price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-xs sm:text-sm text-gray-900 dark:text-white break-words">
                        {RETURN_REASON_LABELS[request.returnReason] || request.returnReason}
                      </div>
                      {request.note && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {request.note}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/return-requests/${request._id}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 flex items-center gap-1 ml-auto justify-end"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 dark:bg-[#1f1f1f] px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-[#3a3a3a] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-[#3a3a3a] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-[#3a3a3a] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

