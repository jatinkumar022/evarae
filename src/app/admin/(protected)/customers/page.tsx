'use client';
import { useEffect, useMemo } from 'react';
import {
  Search,
  User,
  Phone,
  MapPin,
  Download,
} from 'lucide-react';
import { useCustomerStore, Customer } from '@/lib/data/store/customerStore';
import { CustomSelect } from '@/app/admin/components/CustomSelect';

export default function CustomersPage() {
  const {
    customers,
    filters,
    pagination,
    status,
    setFilters,
    fetchCustomers,
  } = useCustomerStore();

  // Fetch customers from API
  useEffect(() => {
    setFilters({ limit: 10 });
  }, [setFilters]);

  // Fetch customers whenever filters change
  useEffect(() => {
    fetchCustomers();
  }, [filters, fetchCustomers]);

  // Customers are filtered and paginated by the API, so we just use them directly

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCustomerTier = (totalSpent?: number) => {
    if (!totalSpent) return { tier: 'New', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300' };
    if (totalSpent >= 500000) return { tier: 'Premium', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' };
    if (totalSpent >= 200000) return { tier: 'Gold', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' };
    if (totalSpent >= 100000) return { tier: 'Silver', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300' };
    return { tier: 'Bronze', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' };
  };

  const getDefaultAddress = (customer: Customer) => {
    return customer.profile?.addresses?.find(addr => addr.isDefaultShipping) || 
           customer.profile?.addresses?.[0];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex md:items-center gap-4 flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-[#bdbdbd]">Manage customer database and view customer details</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="inline-flex items-center text-xs md:text-sm px-4 py-2 border border-gray-300 dark:border-[#525252] shadow-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg p-6 border border-gray-200 dark:border-[#525252]">
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
                onChange={e => setFilters({ search: e.target.value, page: 1 })}
                placeholder="Search by name, email, phone, city..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md sm:text-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600"
              />
            </div>
          </div>

          <div>
            <CustomSelect
              label="Role"
              value={filters.role}
              onChange={(v) => setFilters({ role: v, page: 1 })}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </div>

          <div>
            <CustomSelect
              label="Sort By"
              value={filters.sortBy}
              onChange={(v) => setFilters({ sortBy: v, page: 1 })}
              options={[
                { value: 'createdAt', label: 'Join Date' },
                { value: 'name', label: 'Name' },
                { value: 'totalSpent', label: 'Total Spent' },
                { value: 'totalOrders', label: 'Total Orders' },
                { value: 'lastOrder', label: 'Last Order' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#525252]">
            <thead className="bg-gray-50 dark:bg-[#1d1d1d]">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1d1d1d] divide-y divide-gray-200 dark:divide-[#525252]">
              {status === 'loading' ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-[#bdbdbd]">Loading customers...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-4 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400 dark:text-[#bdbdbd]" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No customers found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-[#bdbdbd]">
                      Try adjusting your search or filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const defaultAddress = getDefaultAddress(customer);
                  const tier = getCustomerTier(customer.totalSpent);
                  return (
                    <tr key={customer._id} className="transition-colors">
                      {/* Customer Name */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tier.color}`}>
                                {tier.tier}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-[#bdbdbd] flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        {defaultAddress ? (
                          <div className="text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span>{defaultAddress.city}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1">
                              {defaultAddress.state}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-[#bdbdbd]">—</span>
                        )}
                      </td>

                      {/* Orders */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {customer.totalOrders || 0}
                        </div>
                        {customer.lastOrderDate && (
                          <div className="text-xs text-gray-500 dark:text-[#bdbdbd] mt-1">
                            Last: {formatDate(customer.lastOrderDate)}
                          </div>
                        )}
                      </td>

                      {/* Total Spent */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {customer.totalSpent ? formatCurrency(customer.totalSpent) : '₹0'}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-3 sm:px-4 py-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-[#242424] transition-colors">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(customer.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-[#525252] flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({ page: pagination.page - 1 })}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242424] border border-gray-300 dark:border-[#525252] rounded-md hover:bg-gray-50 dark:hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ page: pagination.page + 1 })}
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
  );
}
