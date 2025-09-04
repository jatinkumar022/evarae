'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Tag,
  TrendingUp,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';
import { Philosopher } from 'next/font/google';
import './admin.css';
import { useAdminAuth } from '@/lib/data/store/adminAuth';
import { BsCollection } from 'react-icons/bs';
import { logo } from '../assets';
import Image from 'next/image';

const philosopher = Philosopher({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Tag },
  { name: 'Collections', href: '/admin/collections', icon: BsCollection },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory', href: '/admin/inventory', icon: BarChart3 },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loadProfile, logout } = useAdminAuth();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const adminName = profile?.name || 'Admin User';
  const adminEmail = profile?.email || 'admin@example.com';

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen ">
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 flex w-72 flex-col transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col flex-grow bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl">
            {/* Mobile header */}
            <div className="flex h-20 items-center justify-between px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h1
                className={`${philosopher.className} text-2xl font-bold text-white`}
              >
                CAELVI
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-indigo-600'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* ✅ Mobile user profile section */}
            <div className="border-t border-gray-200/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {adminName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-40">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
          {/* Desktop header */}
          <div className="flex h-20 items-center px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                <Image src={logo} alt="logo" className="w-8 h-8 rounded-xl" />
              </div>
              <h1
                className={`${philosopher.className} text-2xl font-bold text-white`}
              >
                CAELVI
              </h1>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-indigo-600'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User profile section */}
          <div className="border-t border-gray-200/50 p-2">
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center w-full p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {adminName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    userDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              <div
                className={`absolute bottom-full left-0 right-0 mb-2 transition-all duration-200 ${
                  userDropdownOpen
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible'
                }`}
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 backdrop-blur-xl p-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <div
          className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-white/20 
  bg-white/70 backdrop-blur-xl px-4 shadow-sm sm:px-6 lg:px-8"
        >
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-3 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Center Search bar */}
          <div className="flex flex-1 justify-center">
            <div className="relative w-full max-w-lg">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search products, orders, users..."
                className="w-full rounded-md border border-gray-200 bg-white py-2.5 pl-12 pr-4 
    text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 
    focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <button className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>

            {/* Divider */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

            {/* User dropdown */}
            <div className="relative hidden lg:flex items-center gap-x-3 cursor-pointer group">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                Welcome, {adminName}
              </span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1">
          <div className="">
            <div className="bg-white   md:p-6 min-h-[calc(100vh-12rem)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
