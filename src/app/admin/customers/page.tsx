'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Star,
  Calendar,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  joinDate: string;
  isActive: boolean;
  tags: string[];
}

const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
    totalOrders: 5,
    totalSpent: 450000,
    lastOrderDate: '2024-01-15T10:00:00Z',
    joinDate: '2023-06-15T10:00:00Z',
    isActive: true,
    tags: ['VIP', 'Regular'],
  },
  {
    id: 'CUST-002',
    name: 'Rahul Patel',
    email: 'rahul.patel@email.com',
    phone: '+91 87654 32109',
    address: {
      street: '456 Oak Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
    },
    totalOrders: 3,
    totalSpent: 225000,
    lastOrderDate: '2024-01-14T15:30:00Z',
    joinDate: '2023-08-20T14:30:00Z',
    isActive: true,
    tags: ['New'],
  },
  {
    id: 'CUST-003',
    name: 'Anjali Singh',
    email: 'anjali.singh@email.com',
    phone: '+91 76543 21098',
    address: {
      street: '789 Pine Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
    totalOrders: 8,
    totalSpent: 680000,
    lastOrderDate: '2024-01-13T09:15:00Z',
    joinDate: '2023-03-10T09:15:00Z',
    isActive: true,
    tags: ['VIP', 'Loyal'],
  },
  {
    id: 'CUST-004',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@email.com',
    phone: '+91 65432 10987',
    address: {
      street: '321 Elm Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
    },
    totalOrders: 2,
    totalSpent: 160000,
    lastOrderDate: '2024-01-12T16:45:00Z',
    joinDate: '2023-11-05T16:45:00Z',
    isActive: true,
    tags: ['New'],
  },
  {
    id: 'CUST-005',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    phone: '+91 54321 09876',
    address: {
      street: '654 Maple Drive',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
    },
    totalOrders: 12,
    totalSpent: 950000,
    lastOrderDate: '2024-01-10T11:20:00Z',
    joinDate: '2023-01-15T11:20:00Z',
    isActive: true,
    tags: ['VIP', 'Loyal', 'Premium'],
  },
];

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'all' ||
      customer.isActive === (statusFilter === 'active');
    return matchesSearch && matchesStatus;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'totalSpent':
        return b.totalSpent - a.totalSpent;
      case 'totalOrders':
        return b.totalOrders - a.totalOrders;
      case 'lastOrder':
        return (
          new Date(b.lastOrderDate).getTime() -
          new Date(a.lastOrderDate).getTime()
        );
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 500000)
      return { tier: 'Premium', color: 'bg-purple-100 text-purple-800' };
    if (totalSpent >= 200000)
      return { tier: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (totalSpent >= 100000)
      return { tier: 'Silver', color: 'bg-gray-100 text-gray-800' };
    return { tier: 'Bronze', color: 'bg-orange-100 text-orange-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search
            </label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Search customers..."
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700"
            >
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="name">Name</option>
              <option value="totalSpent">Total Spent</option>
              <option value="totalOrders">Total Orders</option>
              <option value="lastOrder">Last Order</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedCustomers.map(customer => {
          const tier = getCustomerTier(customer.totalSpent);
          return (
            <div
              key={customer.id}
              className="bg-white shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Customer Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-500">{customer.id}</p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {customer.address.street}, {customer.address.city}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {customer.totalOrders}
                    </div>
                    <div className="text-sm text-gray-500">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                    <div className="text-sm text-gray-500">Total Spent</div>
                  </div>
                </div>

                {/* Customer Tier */}
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tier.color}`}
                  >
                    {tier.tier} Customer
                  </span>
                </div>

                {/* Tags */}
                {customer.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {customer.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Joined: {formatDate(customer.joinDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span>
                      Last Order: {formatDate(customer.lastOrderDate)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">
                      {customer.totalOrders > 10
                        ? '5.0'
                        : customer.totalOrders > 5
                        ? '4.5'
                        : '4.0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedCustomers.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No customers found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
