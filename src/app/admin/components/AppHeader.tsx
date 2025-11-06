"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { useTheme } from "../context/ThemeContext";
import { Menu, X, Search, Bell, Settings, LogOut, Package, ShoppingBag, Users, AlertCircle } from "lucide-react";
import dynamic from 'next/dynamic';

const Modal = dynamic(() => import('./Modal'), {
  ssr: false,
});
import { useAdminAuth } from "@/lib/data/store/adminAuth";

// Search Component
function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </span>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-lg bg-gray-50 dark:bg-[#141414] py-2.5 pl-12 pr-4 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-primary-500/10 dark:focus:ring-primary-600/20 xl:w-[430px]"
        />
      </div>
    </form>
  );
}

// Notification interface
interface Notification {
  id: string;
  type: 'order' | 'product' | 'customer' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
}

export default function AppHeader() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState<{ top: number; right: number } | null>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { logout } = useAdminAuth();
  const { resetTheme } = useTheme();

  // Mock notifications - Replace with API call later
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD-2024-001 has been placed by Priya Sharma',
      time: '2 minutes ago',
      isRead: false,
      link: '/admin/orders/ORD-2024-001',
    },
    {
      id: '2',
      type: 'product',
      title: 'Low Stock Alert',
      message: 'Diamond Solitaire Ring is running low (only 3 items left)',
      time: '15 minutes ago',
      isRead: false,
      link: '/admin/products',
    },
    {
      id: '3',
      type: 'customer',
      title: 'New Customer Registration',
      message: 'Rahul Patel has registered on your store',
      time: '1 hour ago',
      isRead: true,
      link: '/admin/customers',
    },
    {
      id: '4',
      type: 'order',
      title: 'Order Shipped',
      message: 'Order #ORD-2024-002 has been shipped successfully',
      time: '2 hours ago',
      isRead: true,
      link: '/admin/orders/ORD-2024-002',
    },
    {
      id: '5',
      type: 'system',
      title: 'System Update',
      message: 'Your admin panel has been updated to version 2.1.0',
      time: '1 day ago',
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Calculate notification menu position
  const calculateNotificationPosition = () => {
    if (notificationButtonRef.current) {
      const rect = notificationButtonRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      };
    }
    return null;
  };

  // Update notification menu position
  useEffect(() => {
    if (isNotificationOpen && notificationButtonRef.current) {
      const updatePosition = () => {
        const position = calculateNotificationPosition();
        if (position) {
          setNotificationPosition(position);
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isNotificationOpen]);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4" />;
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'customer':
        return <Users className="w-4 h-4" />;
      case 'system':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'product':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'customer':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'system':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const clearAllTokenCookies = () => {
    // Token-related cookie name patterns
    const tokenPatterns = [
      'token',
      'adminToken',
      'accessToken',
      'refreshToken',
      'authToken',
      'sessionToken',
      'userRole',
      'signupToken',
      'auth',
      'session',
    ];
    
    // Get all current cookies
    const allCookies = document.cookie.split(';').map(c => c.trim().split('=')[0]);
    
    // Find all cookies that match token patterns
    const cookiesToDelete = new Set<string>();
    allCookies.forEach(cookieName => {
      const lowerName = cookieName.toLowerCase();
      if (tokenPatterns.some(pattern => lowerName.includes(pattern.toLowerCase()))) {
        cookiesToDelete.add(cookieName);
      }
    });
    
    // Also add explicit token cookie names
    tokenPatterns.forEach(pattern => {
      cookiesToDelete.add(pattern);
      cookiesToDelete.add(pattern.toLowerCase());
      cookiesToDelete.add(pattern.toUpperCase());
    });
    
    // Delete all matching cookies with different path/domain combinations
    const hostname = window.location.hostname;
    const paths = ['/', '/admin', '/admin/'];
    const domains = ['', hostname, `.${hostname}`];
    
    cookiesToDelete.forEach(cookieName => {
      paths.forEach(path => {
        domains.forEach(domain => {
          const domainPart = domain ? `; domain=${domain}` : '';
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domainPart}`;
        });
      });
    });
  };

  const confirmLogout = async () => {
    try {
      // Reset theme to light mode before logout
      resetTheme();
      
      // Clear all token cookies client-side
      clearAllTokenCookies();
      
      // Clear all admin-related cookies and state via API
      await logout();
      
      // Clear any additional localStorage items
      localStorage.removeItem("admin-theme");
      
      setIsLogoutModalOpen(false);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear cookies, reset theme and navigate to login even if logout API fails
      clearAllTokenCookies();
      resetTheme();
      localStorage.removeItem("admin-theme");
      setIsLogoutModalOpen(false);
      router.push('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 flex w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col w-full lg:flex-row lg:items-center lg:justify-between lg:px-6">
        {/* Top Row: Search (Desktop) / Logo (Mobile) and Right Actions */}
        <div className="flex items-center w-full gap-2 px-3 py-3 sm:gap-4 lg:px-0 lg:py-4">
          <Link href="/admin" className="lg:hidden">
            <span className="text-xl font-heading text-primary-600 dark:text-primary-400">
              Caelvi Admin
            </span>
          </Link>

          {/* Search Bar - Desktop only, positioned left-center */}
          <div className="hidden lg:block flex-1">
            <SearchBar />
          </div>

          {/* Right Actions - Aligned to right corner */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <ThemeToggleButton />
            
            <div className="relative">
              <button
                ref={notificationButtonRef}
                className="relative flex items-center justify-center w-11 h-11 text-gray-500 transition-colors bg-gray-50 rounded-full hover:text-gray-700 hover:bg-gray-100 dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#232323] dark:hover:text-white"
                onClick={() => {
                  const position = calculateNotificationPosition();
                  setNotificationPosition(position);
                  setIsNotificationOpen(!isNotificationOpen);
                }}
              >
                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-primary-500 flex">
                    <span className="absolute inline-flex w-full h-full bg-primary-500 rounded-full opacity-75 animate-ping"></span>
                  </span>
                )}
                <Bell className="w-5 h-5" />
              </button>

              {/* Notification Menu */}
              {isNotificationOpen && notificationPosition && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setIsNotificationOpen(false);
                      setNotificationPosition(null);
                    }}
                  />
                  <div
                    className="fixed w-80 z-50 rounded-xl bg-white shadow-2xl border border-gray-200 dark:bg-[#2a2a2a] dark:border-[#404040] ring-1 ring-black/5 dark:ring-white/10"
                    style={{
                      top: `${notificationPosition.top}px`,
                      right: `${notificationPosition.right}px`,
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#404040]">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 mx-auto text-gray-400 dark:text-[#bdbdbd] mb-3" />
                          <p className="text-sm text-gray-500 dark:text-[#bdbdbd]">No notifications</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors border-b border-gray-100 dark:border-[#404040] last:border-b-0 ${
                                !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                              }`}
                            >
                              {notification.link ? (
                                <Link
                                  href={notification.link}
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    setIsNotificationOpen(false);
                                    setNotificationPosition(null);
                                  }}
                                  className="block"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                                      {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                          {notification.title}
                                        </p>
                                        {!notification.isRead && (
                                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                                        )}
                                      </div>
                                      <p className="mt-1 text-xs text-gray-600 dark:text-[#bdbdbd] line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="mt-1.5 text-xs text-gray-500 dark:text-[#bdbdbd]">
                                        {notification.time}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              ) : (
                                <div
                                  onClick={() => markAsRead(notification.id)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                                      {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                          {notification.title}
                                        </p>
                                        {!notification.isRead && (
                                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                                        )}
                                      </div>
                                      <p className="mt-1 text-xs text-gray-600 dark:text-[#bdbdbd] line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="mt-1.5 text-xs text-gray-500 dark:text-[#bdbdbd]">
                                        {notification.time}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 dark:border-[#404040]">
                        <Link
                          href="/admin/notifications"
                          onClick={() => {
                            setIsNotificationOpen(false);
                            setNotificationPosition(null);
                          }}
                          className="block text-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-gray-700 dark:text-gray-400"
              >
                <span className="overflow-hidden rounded-full h-11 w-11 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    A
                  </span>
                </span>
                <span className="hidden mr-1 text-sm font-medium lg:block lg:ml-3 dark:text-gray-300">
                  Admin
                </span>
              </button>

            {isUserMenuOpen && (
              <>
                {/* Backdrop to close menu on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 z-50 rounded-xl bg-white p-3 shadow-2xl border border-gray-200 dark:bg-[#2a2a2a] dark:border-[#404040] ring-1 ring-black/5 dark:ring-white/10">
                  <div className="mb-3 pb-3 border-b border-gray-200 dark:border-[#404040]">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      Admin User
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">
                      admin@caelvi.com
                    </span>
                  </div>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-[#363636] transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 px-3 py-2 mt-2 w-full text-left text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Menu Button + Search Bar - Mobile only */}
        <div className="flex items-center gap-2 sm:gap-3 w-full px-3 pb-3 lg:hidden">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-[#242424] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424] transition-colors flex-shrink-0"
            onClick={toggleMobileSidebar}
            aria-label="Toggle Mobile Menu"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 w-full min-w-0">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        size="md"
        footer={(
          <>
            <button
              type="button"
              onClick={confirmLogout}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#d92d20' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0231a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d92d20'}
            >
              Logout
            </button>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-[#3a3a3a] shadow-sm px-4 py-2 bg-white dark:bg-[#242424] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
            >
              Cancel
            </button>
          </>
        )}
      >
        <div className="sm:flex sm:items-start">
          <div className="mx-auto sm:mx-0 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
            <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to logout? You will need to login again to access the admin panel.
            </p>
          </div>
        </div>
      </Modal>
    </header>
  );
}

