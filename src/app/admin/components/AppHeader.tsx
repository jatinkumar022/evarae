"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { useTheme } from "../context/ThemeContext";
import { Menu, X, Search, Bell, ChevronDown, Settings, LogOut } from "lucide-react";
import Modal from "./Modal";
import { useAdminAuth } from "@/lib/data/store/adminAuth";

export default function AppHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAdminAuth();
  const { resetTheme } = useTheme();

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
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
    <header className="sticky top-0 z-50 flex w-full bg-white dark:bg-[#0a0a0a]">
      <div className="flex flex-col items-center justify-between w-full lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-[#242424] lg:h-11 lg:w-11 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424] transition-colors"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

          <Link href="/admin" className="lg:hidden">
            <span className="text-xl font-heading text-primary-600 dark:text-primary-400">
              Caelvi Admin
            </span>
          </Link>

          <div className="hidden lg:block">
            <form>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-11 w-full rounded-lg bg-transparent dark:bg-[#141414] py-2.5 pl-12 pr-4 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#696969] focus:outline-none focus:ring-2 focus:ring-primary-500/10 dark:focus:ring-primary-600/20 xl:w-[430px]"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 px-4 py-3 lg:gap-4 lg:px-0">
          <ThemeToggleButton />
          
          <button
            className="relative flex items-center justify-center w-11 h-11 text-gray-500 transition-colors bg-white rounded-full hover:text-gray-700 hover:bg-gray-100 dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:bg-[#232323] dark:hover:text-white"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-primary-500">
              <span className="absolute inline-flex w-full h-full bg-primary-500 rounded-full opacity-75 animate-ping"></span>
            </span>
            <Bell className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center text-gray-700 dark:text-gray-400"
            >
              <span className="mr-3 overflow-hidden rounded-full h-11 w-11 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  A
                </span>
              </span>
              <span className="hidden mr-1 text-sm font-medium lg:block dark:text-gray-300">
                Admin
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 text-gray-500 dark:text-gray-400 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
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

