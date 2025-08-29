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
import {
  ringsCat,
  earringsCat,
  braceletsCat,
  pendantsCat,
} from '@/app/(main)/assets/CategoryGrid';
import { useEffect, useRef, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Link from 'next/link';
import { BsInboxes } from 'react-icons/bs';
import MobileNavMenu from './MobileNavMenu';
import { useRouter } from 'next/navigation';
// import { LogoCaelvi } from '@/app/(main)/assets';
import { Philosopher } from 'next/font/google';

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

const popularCategories = [
  { name: 'Rings', href: '#', image: ringsCat },
  { name: 'Earrings', href: '#', image: earringsCat },
  { name: 'Bracelets', href: '#', image: braceletsCat },
  { name: 'Pendants', href: '#', image: pendantsCat },
];

export default function Navbar() {
  const placeholders = [
    'Search Gold Jewellery',
    'Search Diamond Jewellery',
    'Search Rings, Earrings & more...',
  ];
  const trendingSearches = [
    'Rings',
    'Diamond Necklace',
    'Gold Chains',
    '22k Gold',
    'Gifts for Her',
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  // Inline login dropdown (desktop) state
  const [loginMode, setLoginMode] = useState<'mobile' | 'email'>('mobile');
  const [loginStep, setLoginStep] = useState<'phone' | 'otp' | 'done'>('phone');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState<string[]>(Array(6).fill(''));
  const [loginResendIn, setLoginResendIn] = useState(0);
  const loginInputsRef = useRef<Array<HTMLInputElement | null>>([]);
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
    if (loginStep === 'otp') {
      setLoginResendIn(30);
      // focus first OTP input
      loginInputsRef.current[0]?.focus();
      const id = setInterval(() => {
        setLoginResendIn(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(id);
    }
  }, [loginStep]);

  const isValidLoginPhone = /^\d{10}$/.test(loginPhone);
  const isValidLoginEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail);
  const isValidLoginOtp = /^\d{6}$/.test(loginOtp.join(''));

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

  // Sample mini-cart items and helpers (replace with real cart state later)
  const miniCartItems = [
    {
      id: '1',
      name: 'Diamond Pendant',
      price: 95000,
      quantity: 1,
      image: pendantsCat,
    },
    {
      id: '2',
      name: 'Gold Bracelet',
      price: 85000,
      quantity: 1,
      image: braceletsCat,
    },
    {
      id: '3',
      name: 'Ring - Classic',
      price: 65000,
      quantity: 1,
      image: ringsCat,
    },
  ];
  const subtotal = miniCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const formatINR = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);

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

              {/* Desktop hover dropdown for Login */}
              <div className="relative group hidden lg:block">
                <IconButton
                  ariaLabel="My Account - Sign in or manage your account"
                  onClick={() => {
                    router.push('/login');
                  }}
                >
                  <User className="h-5 w-5" />
                </IconButton>
                <div className="hidden lg:block">
                  <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition ease-out duration-150 absolute right-0 mt-2 w-[340px] rounded-md border border-gray-200 bg-white shadow-lg z-50">
                    <div className="p-4">
                      <h3 className="text-sm font-heading text-[oklch(0.39_0.09_17.83)]">
                        Quick sign in
                      </h3>
                      <p className="mt-0.5 text-xs text-[oklch(0.55_0.06_15)]">
                        {loginMode === 'mobile'
                          ? 'Use your mobile number'
                          : 'Use your email'}
                      </p>

                      {/* Mode toggle */}
                      <div className="mt-3 flex justify-center">
                        <div className="inline-flex rounded-full border border-[oklch(0.84_0.04_10.35)] bg-white p-1">
                          <button
                            onClick={() => {
                              setLoginMode('mobile');
                              setLoginStep('phone');
                            }}
                            className={`${
                              loginMode === 'mobile'
                                ? 'bg-[oklch(0.93_0.03_12.01)] text-[oklch(0.39_0.09_17.83)]'
                                : 'text-[oklch(0.55_0.06_15)]'
                            } px-3 py-1.5 rounded-full text-xs font-medium transition-colors`}
                          >
                            Mobile
                          </button>
                          <button
                            onClick={() => {
                              setLoginMode('email');
                              setLoginStep('phone');
                            }}
                            className={`${
                              loginMode === 'email'
                                ? 'bg-[oklch(0.93_0.03_12.01)] text-[oklch(0.39_0.09_17.83)]'
                                : 'text-[oklch(0.55_0.06_15)]'
                            } px-3 py-1.5 rounded-full text-xs font-medium transition-colors`}
                          >
                            Email
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
                                width: `${loginStep === 'otp' ? 100 : 0}%`,
                              }}
                            />
                          </div>

                          {[
                            loginMode === 'mobile' ? 'Mobile' : 'Email',
                            'OTP',
                          ].map((label, idx) => (
                            <li
                              key={label}
                              className="flex flex-col items-center gap-2 relative z-10"
                            >
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                                  idx === 0 && loginStep === 'phone'
                                    ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white'
                                    : idx === 1 && loginStep === 'otp'
                                    ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white'
                                    : 'bg-white border-2 border-[oklch(0.84_0.04_10.35)] text-[oklch(0.55_0.06_15)]'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span
                                className={`text-[10px] ${
                                  (idx === 0 && loginStep === 'phone') ||
                                  (idx === 1 && loginStep === 'otp')
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
                      {loginStep === 'phone' && (
                        <div className="mt-3">
                          {loginMode === 'mobile' ? (
                            <div className="flex gap-2">
                              <div className="inline-flex items-center rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-[oklch(0.93_0.03_12.01)] px-3 py-2 text-xs font-medium text-[oklch(0.55_0.06_15)]">
                                <span className="hidden sm:block">🇮🇳</span> +91
                              </div>
                              <input
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={10}
                                value={loginPhone}
                                onChange={e =>
                                  setLoginPhone(
                                    e.target.value.replace(/\D/g, '')
                                  )
                                }
                                className="flex-1 rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm text-[oklch(0.39_0.09_17.83)] placeholder-[oklch(0.7_0.04_12)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/30 focus:border-[oklch(0.66_0.14_358.91)] transition-all"
                                placeholder="10-digit number"
                              />
                            </div>
                          ) : (
                            <input
                              type="email"
                              value={loginEmail}
                              onChange={e => setLoginEmail(e.target.value)}
                              className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm text-[oklch(0.39_0.09_17.83)] placeholder-[oklch(0.7_0.04_12)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/30 focus:border-[oklch(0.66_0.14_358.91)] transition-all"
                              placeholder="you@example.com"
                            />
                          )}
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => setLoginStep('otp')}
                              disabled={
                                loginMode === 'mobile'
                                  ? !isValidLoginPhone
                                  : !isValidLoginEmail
                              }
                              className={`rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                                loginMode === 'mobile'
                                  ? isValidLoginPhone
                                    ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-md'
                                    : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                                  : isValidLoginEmail
                                  ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-md'
                                  : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                              }`}
                            >
                              Send OTP
                            </button>
                          </div>
                        </div>
                      )}

                      {loginStep === 'otp' && (
                        <div className="mt-3">
                          <p className="text-xs text-[oklch(0.55_0.06_15)] mb-3">
                            Code sent to{' '}
                            <span className="font-medium text-[oklch(0.66_0.14_358.91)]">
                              {loginMode === 'mobile'
                                ? `+91 ${loginPhone}`
                                : loginEmail}
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
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setLoginStep('phone')}
                              className="text-xs text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)]"
                            >
                              Back
                            </button>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={loginResendIn > 0}
                                onClick={() => setLoginResendIn(30)}
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
                        </div>
                      )}

                      {loginStep === 'done' && (
                        <div className="mt-3 text-center">
                          <p className="text-xs text-[oklch(0.55_0.06_15)]">
                            Signed in. You can close this.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile: navigate to login page */}
              <IconButton
                onClick={() => router.push('/login')}
                ariaLabel="My Account - Sign in or manage your account"
                className="lg:hidden"
              >
                <User className="h-5 w-5" />
              </IconButton>

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
                  ariaLabel="Shopping Bag - View cart with 5 items"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span
                    className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white"
                    aria-label="5 items in cart"
                  >
                    5
                  </span>
                </IconButton>
                {/* Mini Cart Dropdown (desktop only) */}
                <div className="hidden lg:block">
                  <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition ease-out duration-150 absolute right-0 mt-2 w-[320px] rounded-md border border-gray-200 bg-white shadow-lg z-50">
                    <div className="p-4">
                      {miniCartItems.length === 0 ? (
                        <p className="text-sm text-gray-600">
                          Your cart is empty.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {miniCartItems.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3"
                            >
                              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-800">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-sm font-medium text-gray-800">
                                {formatINR(item.price)}
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
                  <div className="relative border border-border px-4 flex items-center rounded-md py-1">
                    <Search
                      onClick={() => {
                        if (inputValue.trim()) {
                          router.push(
                            `/search?q=${encodeURIComponent(inputValue.trim())}`
                          );
                          setIsSearchOpen(false);
                        }
                      }}
                      className="h-5 w-5 flex-shrink-0 text-primary mr-4"
                    />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                          router.push(
                            `/search?q=${encodeURIComponent(inputValue.trim())}`
                          );
                          setIsSearchOpen(false);
                        }
                      }}
                      className="w-full bg-transparent text-lg placeholder-gray-400 focus:outline-none  relative z-10"
                      autoFocus
                    />
                    {inputValue === '' && (
                      <div className="absolute left-14 inset-y-0 flex items-center pointer-events-none ">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={currentPlaceholder}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="text-lg text-gray-600  "
                          >
                            {placeholders[currentPlaceholder]}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (inputValue.trim()) {
                          router.push(
                            `/search?q=${encodeURIComponent(inputValue.trim())}`
                          );
                          setIsSearchOpen(false);
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
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {popularCategories.map(cat => (
                          <Link
                            href={cat.href}
                            key={cat.name}
                            className="group block"
                          >
                            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <p className="mt-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-primary">
                              {cat.name}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Trending Searches
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {trendingSearches.map(term => (
                          <button
                            key={term}
                            onClick={() => {
                              router.push(
                                `/search?q=${encodeURIComponent(term)}`
                              );
                              setIsSearchOpen(false);
                            }}
                            className="rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
                            aria-label={`Search for ${term}`}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
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
    </>
  );
}
