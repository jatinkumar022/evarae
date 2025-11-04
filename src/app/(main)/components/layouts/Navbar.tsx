'use client';
import Container from '@/app/(main)/components/layouts/Container';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import {
  Heart,
  ShoppingBag,
  User,
  Search,
  New,
  Store,
  Menu,
} from '@/app/(main)/assets/Navbar';
import { useEffect, useRef, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Link from 'next/link';
import { BsInboxes } from 'react-icons/bs';
import MobileNavMenu from './MobileNavMenu';
import { usePathname, useRouter } from 'next/navigation';
// import { LogoCaelvi } from '@/app/(main)/assets';
import { Philosopher } from 'next/font/google';
import { Eye, EyeOff } from 'lucide-react';
import { userAuthApi } from '@/lib/utils';
import { accountApi } from '@/lib/utils';
import type { UserAccount } from '@/lib/utils';
import {
  ChevronRight,
  Package,
  ShieldUser ,
  MapPin,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  User as MenuUser,
  Heart as MenuHeart,
  Star,
  Clock,
  Truck,
  X,
} from 'lucide-react';
import { useCartStore } from '@/lib/data/mainStore/cartStore';
import { usePublicCategoryStore } from '@/lib/data/mainStore/categoryStore';

const philosopher = Philosopher({
  subsets: ['latin'],
  weight: ['400', '700'],
});
const NavLink = ({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <Link
    href={href}
    className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100/80 hover:text-primary cursor-pointer"
  >
    <div className="flex items-center gap-2">
      {icon}
      {children}
    </div>
  </Link>
);

type IconButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
};

function IconButton({
  onClick,
  children,
  className = '',
  ariaLabel,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-full p-2  transition-colors hover:bg-gray-100/80  hover:text-primary cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

// Search history localStorage key
const SEARCH_HISTORY_KEY = 'caelvi_search_history';
const MAX_SEARCH_HISTORY = 10;

// Helper functions for search history
const getSearchHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const saveSearchToHistory = (query: string): void => {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const history = getSearchHistory();
    const trimmedQuery = query.trim().toLowerCase();
    
    // Remove if already exists (to move to top)
    const filteredHistory = history.filter(
      item => item.toLowerCase() !== trimmedQuery
    );
    
    // Add to beginning and limit to MAX_SEARCH_HISTORY
    const updatedHistory = [
      query.trim(), // Keep original casing
      ...filteredHistory,
    ].slice(0, MAX_SEARCH_HISTORY);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch {
    // Silently fail if localStorage is not available
  }
};

const clearSearchHistory = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // Silently fail if localStorage is not available
  }
};

export default function Navbar() {
  const { items, load } = useCartStore();
  const { categories, status } = usePublicCategoryStore();
  useEffect(() => {
    load();
  }, [load]);

  const placeholders = [
    'Search Gold Jewellery',
    'Search Diamond Jewellery',
    'Search Rings, Earrings & more...',
  ];
  const shortPlaceholders = [
    'Search Jewellery',
    'Search Rings, Earrings & more...',
    'Search...',
  ];
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const isLoadingCategories = status === 'loading';
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  // Inline login dropdown (desktop) state
  const [loginStep, setLoginStep] = useState<'email' | 'verify' | 'done'>(
    'email'
  );
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginOtp, setLoginOtp] = useState<string[]>(Array(6).fill(''));
  const [loginResendIn, setLoginResendIn] = useState(0);
  const loginInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [loginEmailError, setLoginEmailError] = useState<string | null>(null);
  const [loginPasswordError, setLoginPasswordError] = useState<string | null>(
    null
  );
  const [loginOtpError, setLoginOtpError] = useState<string | null>(null);
  const pathname = usePathname();

  const isCartPage = pathname === '/cart';

  // Load search history when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setSearchHistory(getSearchHistory());
    }
  }, [isSearchOpen]);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await accountApi.me();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    })();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  // Login dropdown helpers
  useEffect(() => {
    if (loginStep === 'verify' && authMode === 'otp') {
      setLoginResendIn(30);
      // focus first OTP input
      loginInputsRef.current[0]?.focus();
      const id = setInterval(() => {
        setLoginResendIn(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(id);
    }
  }, [loginStep, authMode]);

  const isValidLoginEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail);
  const isValidLoginOtp = /^\d{6}$/.test(loginOtp.join(''));
  const isValidLoginPassword = loginPassword.length >= 6;

  const handleLoginOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const next = [...loginOtp];
    (next as string[])[index] = digit;
    setLoginOtp(next);
    if (digit && index < loginOtp.length - 1) {
      loginInputsRef.current[index + 1]?.focus();
    }
  };

  const handleLoginOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (loginOtp[index]) {
        const next = [...loginOtp];
        (next as string[])[index] = '';
        setLoginOtp(next);
      } else if (index > 0) {
        loginInputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0)
      loginInputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < loginOtp.length - 1)
      loginInputsRef.current[index + 1]?.focus();
  };

  const continueFromEmail = async () => {
    if (!isValidLoginEmail) return;
    setLoginEmailError(null);
    try {
      const { exists } = await userAuthApi.checkEmail(loginEmail);
      if (!exists) {
        setLoginEmailError('No account found with this email. Please sign up.');
        return;
      }
      if (authMode === 'otp') {
        await userAuthApi.loginRequestOtp(loginEmail);
        setLoginResendIn(30);
      }
      setLoginStep('verify');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to continue';
      setLoginEmailError(message);
    }
  };

  const handleNavbarPasswordLogin = async () => {
    setLoginPasswordError(null);
    if (!isValidLoginEmail || !isValidLoginPassword) return;
    try {
      await userAuthApi.loginWithPassword(loginEmail, loginPassword);
      setLoginStep('done');
      try {
        const { user } = await accountApi.me();
        setCurrentUser(user);
      } catch {}
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid credentials';
      setLoginPasswordError(message);
    }
  };

  const handleNavbarVerifyOtp = async () => {
    setLoginOtpError(null);
    if (!isValidLoginOtp) return;
    try {
      await userAuthApi.loginVerifyOtp(loginEmail, loginOtp.join(''));
      setLoginStep('done');
      try {
        const { user } = await accountApi.me();
        setCurrentUser(user);
      } catch {}
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid OTP';
      setLoginOtpError(message);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await userAuthApi.logout();
      setCurrentUser(null);
      setLoginStep('email');
      setLoginEmail('');
      setLoginPassword('');
      setLoginOtp(Array(6).fill(''));
      setShowLogoutModal(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const miniCartItems = items.map(i => ({
    id: String(i?.product?._id || i?.product?.id),
    name: i?.product?.name,
    price: i?.product?.discountPrice ?? i?.product?.price ?? 0,
    quantity: i?.quantity || 1,
    image: (i?.product?.images && i.product.images[0]) || i?.product?.thumbnail,
  }));
  const subtotal = miniCartItems.reduce(
    (sum: number, item) => sum + item.price * item.quantity,
    0
  );
  const formatINR = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);

  // profile

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toggleSubmenu = (menuKey: string) => {
    setActiveSubmenu(activeSubmenu === menuKey ? null : menuKey);
  };
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setShowProfileDrawer(false);
      }
    }

    if (showProfileDrawer) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDrawer, setShowProfileDrawer]);

  // Handle Escape key and body scroll lock for logout modal
  useEffect(() => {
    if (showLogoutModal) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoggingOut) {
          setShowLogoutModal(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showLogoutModal, isLoggingOut]);

  const menuItems = [
    {
      key: 'account',
      icon: MenuUser,
      label: 'Account Settings',
      href: '/account',
      submenu: [
        {
          icon: MenuUser,
          label: 'Profile Information',
          href: '/account/profile?tab=profile',
        },
        {
          icon: Shield,
          label: 'Privacy & Security',
          href: '/account/profile?tab=privacy',
        },
        {
          icon: Bell,
          label: 'Notifications',
          href: '/account/profile?tab=preferences',
        },
       
        { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
      ],
    },
    {
      key: 'orders',
      icon: Package,
      label: 'My Orders',
      href: '/orders',
      submenu: [
        { icon: Clock, label: 'Order History', href: '/orders/history' },
        { icon: Truck, label: 'Track Orders', href: '/orders/tracking' },
        { icon: Package, label: 'Returns & Refunds', href: '/orders/returns' },
      ],
    },
    {
      key: 'wishlist',
      icon: MenuHeart,
      label: 'Wishlist & Favorites',
      href: '/wishlist',
      submenu: [{ icon: MenuHeart, label: 'My Wishlist', href: '/wishlist' }],
    },
    // {
    //   key: 'rewards',
    //   icon: Gift,
    //   label: 'Rewards & Points',
    //   href: '/rewards',
    //   submenu: [
    //     { icon: Gift, label: 'My Points', href: '/rewards/points' },
    //     { icon: Star, label: 'Membership Benefits', href: '/rewards/benefits' },
    //     { icon: Gift, label: 'Referral Program', href: '/rewards/referrals' },
    //   ],
    // },
  ];

  const quickActions = [
    { icon: HelpCircle, label: 'Help & Support', href: '/faqs' },
    { icon: ShieldUser, label: 'Contact Us', href: '/contact-us' },
    // { icon: Settings, label: 'Preferences', href: '/preferences' },
  ];

  return (
    <>
      <header className="fixed top-0 z-30 w-full border-b border-gray-200/80 bg-white">
        <Container>
          <div className="flex h-20 items-center justify-between">
            {/* Left Group */}
            <div className="flex items-center gap-2 lg:flex-1">
              <div className="lg:hidden">
                <Menu
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                  className="h-5 w-5 max-lg:text-primary flex flex-col gap-1"
                />
              </div>
              <div className="lg:hidden">
                <Link href="/" className="cursor-pointer">
                  <h1
                    className={`${philosopher.className} text-lg   text-primary `}
                  >
                    {/* <LogoCaelvi className="h-4" /> */}
                    CAELVI
                  </h1>
                </Link>
              </div>
              <nav className="hidden items-center gap-2 lg:flex ">
                <NavLink
                  href="/all-jewellery"
                  icon={<Store className="h-4 w-4" />}
                >
                  All Jewellery
                </NavLink>
                <NavLink
                  href="/new-arrivals"
                  icon={<New className="h-4 w-4" />}
                >
                  New Arrivals
                </NavLink>
                <NavLink href="/collections" icon={<BsInboxes size={13} />}>
                  Collections
                </NavLink>
              </nav>
            </div>

            {/* Centered Logo (Desktop-only) */}
            <Link href="/" className="hidden lg:block cursor-pointer">
              <h1
                className={`${philosopher.className} text-3xl   text-primary `}
              >
                {/* <LogoCaelvi className="h-4" /> */}
                CAELVI
              </h1>
            </Link>

            {/* Right Group */}
            <div className="flex items-center justify-end gap-2 lg:flex-1 max-lg:text-primary">
              <IconButton
                onClick={() => setIsSearchOpen(true)}
                ariaLabel="Open search"
              >
                <Search className="h-5 w-5" />
              </IconButton>

              {/* Desktop hover dropdown for Login or Profile */}
              <div className="sm:relative group">
                <IconButton
                  ariaLabel="My Account - Sign in or manage your account"
                  onClick={() => {
                    if (!currentUser) {
                      // if not logged in → click = redirect
                      router.push('/login');
                    } else {
                      // if logged in → toggle profile drawer
                      setShowProfileDrawer(prev => !prev);
                    }
                  }}
                >
                  <User className="h-5 w-5" />
                </IconButton>
                {currentUser && showProfileDrawer && (
                  <div
                    ref={drawerRef}
                    className="absolute right-0 mt-2 sm:w-[340px] w-screen sm:rounded-md border border-gray-200 bg-white shadow-lg z-50"
                  >
                    {/* User Profile Header */}
                    <div className="bg-gradient-to-r from-[#d56a90]/5 to-[#d56a90]/10 p-6 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#d56a90]/25 to-[#d56a90]/30 flex items-center justify-center text-gray-700 font-medium text-lg shadow-lg">
                            {(currentUser.name || currentUser.email || '?')
                              .toString()
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-medium text-gray-700 truncate">
                            {currentUser.name || 'My Account'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {currentUser.email}
                          </p>
                          {currentUser.membershipTier && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Star className="w-3 h-3 mr-1" />
                                {currentUser.membershipTier} Member
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="">
                      <div className="py-2">
                        {menuItems.map(item => (
                          <div key={item.key} className="relative">
                            <button
                              className="w-full cursor-pointer"
                              aria-label={`Toggle ${item.label}`}
                            >
                              <div
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                onClick={() => toggleSubmenu(item.key)}
                              >
                                <div className="flex items-center gap-3">
                                  <item.icon className="w-5 h-5 text-gray-500" />
                                  <div className="font-medium hover:text-[#d56a90] transition-colors">
                                    {item.label}
                                  </div>
                                </div>
                                <div className="p-1 rounded hover:bg-gray-100">
                                  <ChevronRight
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                      activeSubmenu === item.key
                                        ? 'rotate-90'
                                        : ''
                                    }`}
                                  />
                                </div>
                              </div>
                            </button>

                            {/* Submenu */}
                            {activeSubmenu === item.key && (
                              <div className="bg-gray-50 border-l-2 border-[#d56a90]/30">
                                {item.submenu.map((subItem, index) => (
                                  <a
                                    key={index}
                                    href={subItem.href}
                                    className="flex items-center gap-3 px-8 py-2.5 text-sm text-gray-600 hover:text-[#d56a90] hover:bg-[#d56a90]/5 transition-colors duration-200"
                                  >
                                    <subItem.icon className="w-4 h-4" />
                                    {subItem.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Separator */}
                      <div className="border-t border-gray-200 my-2"></div>

                      {/* Quick Actions */}
                      <div className="py-2">
                        {quickActions.map((action, index) => (
                          <a
                            key={index}
                            href={action.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#d56a90] transition-colors duration-200"
                          >
                            <action.icon className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">{action.label}</span>
                          </a>
                        ))}
                      </div>

                      {/* Separator */}
                      <div className="border-t border-gray-200 my-2"></div>

                      {/* Logout Button */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowLogoutModal(true);
                            setShowProfileDrawer(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#d92d20] hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </button>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-3 rounded-b-md border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Version 2.1.0</span>
                        <span>© 2025 Caelvi Jewellery</span>
                      </div>
                    </div>
                  </div>
                )}
                {!currentUser && (
                  <div className="hidden lg:block">
                    <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition ease-out duration-150 p-4 absolute right-0 mt-2 w-[340px] rounded-md border border-gray-200 bg-white shadow-lg z-50">
                      <h3 className="text-sm font-heading text-[oklch(0.39_0.09_17.83)]">
                        Quick sign in
                      </h3>
                      <p className="mt-0.5 text-xs text-[oklch(0.55_0.06_15)]">
                        Use your email
                      </p>

                      {/* Auth mode toggle (Password / OTP) */}
                      <div className="mt-3 flex justify-center">
                        <div className="inline-flex rounded-full border border-[oklch(0.84_0.04_10.35)] bg-white p-1">
                          <button
                            onClick={() => setAuthMode('password')}
                            className={`${
                              authMode === 'password'
                                ? 'bg-[oklch(0.93_0.03_12.01)] text-[oklch(0.39_0.09_17.83)]'
                                : 'text-[oklch(0.55_0.06_15)]'
                            } px-3 py-1.5 rounded-full text-xs font-medium transition-colors`}
                          >
                            Password
                          </button>
                          <button
                            onClick={() => setAuthMode('otp')}
                            className={`${
                              authMode === 'otp'
                                ? 'bg-[oklch(0.93_0.03_12.01)] text-[oklch(0.39_0.09_17.83)]'
                                : 'text-[oklch(0.55_0.06_15)]'
                            } px-3 py-1.5 rounded-full text-xs font-medium transition-colors`}
                          >
                            OTP
                          </button>
                        </div>
                      </div>

                      {/* Stepper minimal */}
                      <div className="mt-3 rounded-md border border-[oklch(0.84_0.04_10.35)]/50 bg-white/80 backdrop-blur-sm px-3 py-2">
                        <ol className="relative flex items-center justify-between">
                          <div className="absolute left-4 right-4 top-2">
                            <div className="h-px w-full bg-[oklch(0.84_0.04_10.35)]/40 rounded-full" />
                            <div
                              className="h-px bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] via-[oklch(0.62_0.15_3)] to-[oklch(0.58_0.16_8)] rounded-full transition-all duration-300 ease-out"
                              style={{
                                width: `${loginStep === 'verify' ? 100 : 0}%`,
                              }}
                            />
                          </div>

                          {[
                            'Email',
                            authMode === 'password' ? 'Password' : 'OTP',
                          ].map((label, idx) => (
                            <li
                              key={label}
                              className="flex flex-col items-center gap-2 relative z-10"
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                                  idx === 0 && loginStep === 'email'
                                    ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white'
                                    : idx === 1 && loginStep === 'verify'
                                    ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white'
                                    : 'bg-white border-2 border-[oklch(0.84_0.04_10.35)] text-[oklch(0.55_0.06_15)]'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span
                                className={`text-[10px] ${
                                  (idx === 0 && loginStep === 'email') ||
                                  (idx === 1 && loginStep === 'verify')
                                    ? 'text-[oklch(0.66_0.14_358.91)]'
                                    : 'text-[oklch(0.55_0.06_15)]'
                                }`}
                              >
                                {label}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Content */}
                      {loginStep === 'email' && (
                        <div className="mt-3">
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={e => {
                              setLoginEmail(e.target.value);
                              if (loginEmailError) setLoginEmailError(null);
                            }}
                            className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm text-[oklch(0.39_0.09_17.83)] placeholder-[oklch(0.7_0.04_12)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/30 focus:border-[oklch(0.66_0.14_358.91)] transition-all"
                            placeholder="you@example.com"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                continueFromEmail();
                              }
                            }}
                          />
                          {loginEmailError && (
                            <p className="mt-1 text-[10px] text-red-600">
                              {loginEmailError}
                            </p>
                          )}
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={continueFromEmail}
                              disabled={!isValidLoginEmail}
                              className={`rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                                isValidLoginEmail
                                  ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-md'
                                  : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                              }`}
                            >
                              Continue
                            </button>
                          </div>
                        </div>
                      )}

                      {loginStep === 'verify' && (
                        <div className="mt-3">
                          {authMode === 'password' ? (
                            <>
                              <div className="relative mb-3">
                                <input
                                  type={showLoginPassword ? 'text' : 'password'}
                                  value={loginPassword}
                                  onChange={e =>
                                    setLoginPassword(e.target.value)
                                  }
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleNavbarPasswordLogin();
                                    }
                                  }}
                                  placeholder="Your password"
                                  className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 pr-10 text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowLoginPassword(!showLoginPassword)
                                  }
                                  className="absolute inset-y-0 right-2 flex items-center text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)]"
                                >
                                  {showLoginPassword ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                              {loginPasswordError && (
                                <p className="mb-2 text-[10px] text-red-600">
                                  {loginPasswordError}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => setLoginStep('email')}
                                  className="text-xs text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)]"
                                >
                                  Back
                                </button>
                                <button
                                  onClick={handleNavbarPasswordLogin}
                                  disabled={!isValidLoginPassword}
                                  className={`rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                                    isValidLoginPassword
                                      ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-md'
                                      : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                                  }`}
                                >
                                  Login
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-[oklch(0.55_0.06_15)] mb-3">
                                Code sent to{' '}
                                <span className="font-medium text-[oklch(0.66_0.14_358.91)]">
                                  {loginEmail}
                                </span>
                              </p>
                              <div className="flex gap-2.5 mb-3">
                                {loginOtp.map((d, i) => (
                                  <input
                                    key={i}
                                    ref={el => {
                                      loginInputsRef.current[i] = el;
                                    }}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={d}
                                    onChange={e =>
                                      handleLoginOtpChange(i, e.target.value)
                                    }
                                    onKeyDown={e => handleLoginOtpKeyDown(i, e)}
                                    className="aspect-square w-8 md:w-10 text-center rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white text-base font-semibold text-[oklch(0.39_0.09_17.83)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/30 focus:border-[oklch(0.66_0.14_358.91)] transition-all"
                                  />
                                ))}
                              </div>
                              {loginOtpError && (
                                <p className="mb-2 text-[10px] text-red-600">
                                  {loginOtpError}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => setLoginStep('email')}
                                  className="text-xs text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)]"
                                >
                                  Back
                                </button>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    disabled={loginResendIn > 0}
                                    onClick={async () => {
                                      try {
                                        await userAuthApi.loginRequestOtp(
                                          loginEmail
                                        );
                                        setLoginResendIn(30);
                                      } catch (e) {
                                        setLoginOtpError(
                                          e instanceof Error
                                            ? e.message
                                            : 'Failed to resend OTP'
                                        );
                                      }
                                    }}
                                    className={`text-xs ${
                                      loginResendIn > 0
                                        ? 'text-[oklch(0.7_0.04_12)] cursor-not-allowed'
                                        : 'text-[oklch(0.66_0.14_358.91)] hover:text-[oklch(0.58_0.16_8)]'
                                    }`}
                                  >
                                    {loginResendIn > 0
                                      ? `Resend in 00:${String(
                                          loginResendIn
                                        ).padStart(2, '0')}`
                                      : 'Resend OTP'}
                                  </button>
                                  <button
                                    onClick={handleNavbarVerifyOtp}
                                    disabled={!isValidLoginOtp}
                                    className={`rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                                      isValidLoginOtp
                                        ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-md'
                                        : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                                    }`}
                                  >
                                    Verify
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {loginStep === 'done' && (
                        <div className="mt-3 text-center">
                          <p className="text-xs text-[oklch(0.55_0.06_15)]">
                            Signed in. You can close this.
                          </p>
                        </div>
                      )}
                      {/* Google Sign-In */}
                      {loginStep !== 'done' && (
                        <div className="mt-3">
                          <a
                            href="/api/auth/google"
                            className="w-full flex items-center justify-center gap-2 rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-xs text-[oklch(0.39_0.09_17.83)] hover:bg-[oklch(0.93_0.03_12.01)] transition-all"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                fill="#FFC107"
                                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.156,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.046,8.955,20,20,20c11.046,0,20-8.954,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                              />
                              <path
                                fill="#FF3D00"
                                d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.156,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                              />
                              <path
                                fill="#4CAF50"
                                d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.19-5.238C29.173,35.091,26.715,36,24,36c-5.202,0-9.62-3.317-11.283-7.955l-6.532,5.027C9.601,40.556,16.319,44,24,44z"
                              />
                              <path
                                fill="#1976D2"
                                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-3.994,5.565c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.996,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                              />
                            </svg>
                            Continue with Google
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <IconButton
                onClick={() => {
                  router.push('/wishlist');
                }}
                ariaLabel="Wishlist - View your saved items"
              >
                <Heart className="h-5 w-5" />
              </IconButton>
              <div className="relative group">
                <IconButton
                  onClick={() => {
                    router.push('/cart');
                  }}
                  ariaLabel={`Shopping Bag - View cart with ${items.length} items`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span
                    className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white"
                    aria-label={`${items.length} items in cart`}
                  >
                    {items.length}
                  </span>
                </IconButton>
                {/* Mini Cart Dropdown (desktop only) */}
                <div className={`hidden ${!isCartPage ? 'lg:block ' : ''}`}>
                  <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition ease-out duration-150 absolute right-0 mt-2 w-[320px] rounded-md border border-gray-200 bg-white shadow-lg z-50">
                    <div className="p-4">
                      {items.length === 0 ? (
                        <p className="text-sm text-gray-600">
                          Your cart is empty.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {items.map(i => (
                            <div
                              key={String(i?.product?._id || i?.product?.id)}
                              className="flex items-center gap-3"
                            >
                              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                <Image
                                  src={String(
                                    (i?.product?.images &&
                                      (i.product.images[0] as string)) ??
                                      i?.product?.thumbnail
                                  )}
                                  alt={i?.product?.name || 'Product'}
                                  className="h-full w-full object-cover"
                                  width={56}
                                  height={56}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-800">
                                  {i?.product?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Qty: {i?.quantity || 1}
                                </p>
                              </div>
                              <div className="text-sm font-medium text-gray-800">
                                {new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: 'INR',
                                  maximumFractionDigits: 0,
                                }).format(
                                  i?.product?.discountPrice ??
                                    i?.product?.price ??
                                    0
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex items-center justify-between text-sm font-medium text-gray-800">
                              <span>Subtotal</span>
                              <span>{formatINR(subtotal)}</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Link
                                href="/cart"
                                className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-center text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                              >
                                View Cart
                              </Link>
                              <Link
                                href="/checkout"
                                className="flex-1 rounded-md bg-primary px-3 py-2 text-center text-sm text-white transition-colors hover:bg-primary/90"
                              >
                                Checkout
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="bg-white "
              onClick={e => e.stopPropagation()}
            >
              <Container>
                <div className="py-8">
                  {/* Search Input */}
                  <div className="relative border border-border px-2 sm:px-3 md:px-4 flex items-center rounded-md py-1">
                    <Search
                      onClick={() => {
                        if (inputValue.trim()) {
                          saveSearchToHistory(inputValue.trim());
                          router.push(
                            `/search?q=${encodeURIComponent(inputValue.trim())}`
                          );
                          setIsSearchOpen(false);
                          setInputValue('');
                        }
                      }}
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-primary mr-2 sm:mr-4 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                          saveSearchToHistory(inputValue.trim());
                          router.push(
                            `/search?q=${encodeURIComponent(inputValue.trim())}`
                          );
                          setIsSearchOpen(false);
                          setInputValue('');
                        }
                      }}
                      className="w-full bg-transparent text-sm sm:text-base md:text-lg placeholder-gray-400 focus:outline-none relative z-10"
                      autoFocus
                    />
                    {inputValue === '' && (
                      <div className="absolute left-10 sm:left-14 inset-y-0 flex items-center pointer-events-none">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={currentPlaceholder}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm sm:text-base md:text-lg text-gray-600"
                          >
                            <span className="hidden sm:inline">
                              {placeholders[currentPlaceholder]}
                            </span>
                            <span className="sm:hidden">
                              {shortPlaceholders[currentPlaceholder]}
                            </span>
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (inputValue.trim()) {
                          saveSearchToHistory(inputValue.trim());
                          router.push(
                            `/search?q=${encodeURIComponent(inputValue.trim())}`
                          );
                          setIsSearchOpen(false);
                          setInputValue('');
                        }
                      }}
                      className="px-4 py-1.5 hidden lg:block bg-primary text-white rounded-md hover:bg-primary/90 transition-colors ml-4"
                      aria-label="Search"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2 text-gray-600 transition-colors hover:text-primary ml-2"
                      aria-label="Close search"
                    >
                      <RxCross2 size={18} />
                    </button>
                  </div>
                  {/* Content */}
                  <div className="pt-10 grid sm:grid-cols-2 gap-5 sm:gap-12">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Popular Categories
                      </h3>
                      {isLoadingCategories ? (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="aspect-square w-full rounded-md bg-gray-100 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : categories.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          {categories.slice(0, 4).map(cat => (
                            <Link
                              href={`/shop/${cat.slug}`}
                              key={cat._id || cat.slug}
                              onClick={() => setIsSearchOpen(false)}
                              className="group block"
                            >
                              <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                                {cat.image ? (
                                  <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    width={200}
                                    height={200}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                    <span className="text-gray-500 text-sm font-medium">
                                      {cat.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-primary">
                                {cat.name}
                              </p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-gray-500">
                          No categories available
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">
                          Recent Searches
                        </h3>
                        {searchHistory.length > 0 && (
                          <button
                            onClick={() => {
                              clearSearchHistory();
                              setSearchHistory([]);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Clear search history"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {searchHistory.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {searchHistory.map((term, index) => (
                            <button
                              key={`${term}-${index}`}
                              onClick={() => {
                                saveSearchToHistory(term);
                                router.push(
                                  `/search?q=${encodeURIComponent(term)}`
                                );
                                setIsSearchOpen(false);
                                setInputValue('');
                              }}
                              className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
                              aria-label={`Search for ${term}`}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-gray-500">
                          No recent searches
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Container>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Menu */}
      <MobileNavMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40"
            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none z-50">
            <div
              className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-xl flex flex-col pointer-events-auto border border-[oklch(0.84_0.04_10.35)]/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="rounded-t-2xl flex items-center justify-between p-5 border-b border-[oklch(0.84_0.04_10.35)]/30 bg-white flex-shrink-0">
                <h2 className="text-lg font-medium text-gray-900">
                  Sign Out
                </h2>
                <button
                  onClick={() => !isLoggingOut && setShowLogoutModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                  disabled={isLoggingOut}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <LogOut className="h-6 w-6 text-[#d92d20]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Are you sure you want to sign out? You&apos;ll need to sign in again to access your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Buttons - Fixed at Bottom */}
              <div className="rounded-b-2xl border-t border-[oklch(0.84_0.04_10.35)]/30 bg-gray-50 p-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-normal rounded-md hover:bg-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-5 py-2.5 bg-[#d92d20] text-white text-sm font-normal rounded-md hover:bg-[#c0231a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing out...
                    </span>
                  ) : (
                    'Sign Out'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
