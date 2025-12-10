'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/app/(main)/components/layouts/Container';
import { Eye, EyeOff } from 'lucide-react';
import { useUserAuth } from '@/lib/data/mainStore/userAuth';
import { useUserAccountStore } from '@/lib/data/mainStore/userAccountStore';
import { Spinner } from '@/app/(main)/components/ui/ScaleLoader';

export default function LoginPage() {
  type Step = 'phone' | 'otp' | 'done';

  const [step, setStep] = useState<Step>('phone');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const {
    setEmail: setStoreEmail,
    requestLoginOtp,
    verifyLoginOtp,
    resendInSec,
  } = useUserAuth();
  const hydrateAccount = useUserAccountStore(state => state.hydrate);
  const refreshAccount = useUserAccountStore(state => state.refresh);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );
  const combinedOtp = useMemo(() => otp.join(''), [otp]);
  const isValidOtp = useMemo(() => /^\d{6}$/.test(combinedOtp), [combinedOtp]);
  const isValidPassword = useMemo(() => password.length >= 6, [password]);

  // Stepper helpers (2 steps)
  const stepItems = [
    {
      key: 'phone' as const,
      label: 'Email',
      number: 1,
    },
    {
      key: 'otp' as const,
      label: authMode === 'password' ? 'Password' : 'OTP',
      number: 2,
    },
  ];
  const currentStepIndex =
    step === 'done'
      ? stepItems.length - 1
      : stepItems.findIndex(s => s.key === step);
  const progressPercent = (currentStepIndex / (stepItems.length - 1)) * 100;

  useEffect(() => {
    if (step === 'otp' && authMode === 'otp') inputsRef.current[0]?.focus();
  }, [step, authMode]);

  // resend cooldown handled by store

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      const cleared = [...otp];
      cleared[index] = '';
      setOtp(cleared);
      return;
    }

    const next = [...otp];

    if (digits.length === 1) {
      next[index] = digits;
      setOtp(next);
      if (index < otp.length - 1) inputsRef.current[index + 1]?.focus();
      return;
    }

    let lastFilled = index;
    for (let offset = 0; offset < digits.length && index + offset < otp.length; offset++) {
      next[index + offset] = digits[offset];
      lastFilled = index + offset;
    }
    setOtp(next);
    if (lastFilled < otp.length - 1) {
      inputsRef.current[lastFilled + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0)
      inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < otp.length - 1)
      inputsRef.current[index + 1]?.focus();
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValidOtp) {
        handleVerify();
      }
    }
  };

  const goToNext = async () => {
    if (!isValidEmail || isContinueLoading) return;
    setIsContinueLoading(true);
    setStoreEmail(email);
    setEmailError(null);
    try {
      const { userAuthApi } = await import('@/lib/utils');
      const { exists } = await userAuthApi.checkEmail(email);
      if (!exists) {
        setEmailError('No account found with this email. Please sign up.');
        return;
      }
      if (authMode === 'otp') {
        await requestLoginOtp();
      }
      setStep('otp');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to continue';
      setEmailError(message);
    } finally {
      setIsContinueLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!isValidEmail || !isValidPassword || isPasswordLoading) return;
    setError(null);
    setIsPasswordLoading(true);
    try {
      const { userAuthApi } = await import('@/lib/utils');
      const res = await userAuthApi.loginWithPassword(email, password);
      if (res?.ok && res.user) {
        hydrateAccount({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
        });
        await refreshAccount();
        setStep('done');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid credentials';
      setError(message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isValidOtp || isOtpLoading) return;
    setIsOtpLoading(true);
    try {
      setOtpError(null);
      const user = await verifyLoginOtp(otp.join(''));
      if (user) {
        hydrateAccount({
          id: user.id,
          name: user.name,
          email: user.email,
        });
        await refreshAccount();
        setStep('done');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid OTP';
      setOtpError(message);
    } finally {
      setIsOtpLoading(false);
    }
  };
  const applyOtpFromText = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, otp.length);
    if (!digits) return;

    const next = [...otp];
    for (let i = 0; i < digits.length; i++) {
      next[i] = digits[i];
    }
    setOtp(next);

    const lastIndex = Math.min(digits.length - 1, otp.length - 1);
    inputsRef.current[lastIndex]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardText = e.clipboardData?.getData('text');
    if (clipboardText) {
      e.preventDefault();
      applyOtpFromText(clipboardText);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
      e.preventDefault();
      navigator.clipboard
        .readText()
        .then(applyOtpFromText)
        .catch(() => {
          // Ignore errors to avoid blocking manual input
        });
    }
  };
  return (
    <main className="">
      <Container>
        <div className="py-5 mt-10">
          <div className="max-w-xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-heading bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent mb-1.5">
                Login to your account
              </h1>
              <p className="text-sm text-[oklch(0.55_0.06_15)] font-light">
                Continue with your email{' '}
                {authMode === 'password'
                  ? 'and password'
                  : 'and a one-time password'}
                .
              </p>
            </div>

            {/* Email-only: choose Password or OTP */}
            {step === 'phone' && (
              <div className="mb-3 flex justify-center">
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
            )}
            {step !== 'done' ? (
              <div className="mb-4">
                <a
                  href="/api/auth/google"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-4 py-2.5 text-sm text-[oklch(0.39_0.09_17.83)] hover:bg-[oklch(0.93_0.03_12.01)] transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-4 h-4"
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
            ) : (
              ''
            )}

            {/* Stepper */}
            <div className="mb-6 rounded-xl border border-[oklch(0.84_0.04_10.35)]/50 bg-white/80 backdrop-blur-sm px-4 py-3 shadow">
              <ol className="relative flex items-center justify-between">
                {/* connector lines */}
                <div className="absolute left-5 right-5 top-2">
                  <div className="h-px w-full bg-[oklch(0.84_0.04_10.35)]/40 rounded-full" />
                  <div
                    className="h-px bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] via-[oklch(0.62_0.15_3)] to-[oklch(0.58_0.16_8)] rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="h-1 bg-[oklch(0.66_0.14_358.91)]/25 rounded-full blur-[2px] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {stepItems.map((item, index) => {
                  const isCompleted =
                    step === 'done' || index < currentStepIndex;
                  const isActive =
                    step !== 'done' && index === currentStepIndex;
                  return (
                    <li
                      key={item.key}
                      className="flex flex-col items-center gap-3 relative z-10"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs  transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white shadow-md'
                            : isActive
                            ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white shadow-lg scale-110 ring-2 ring-[oklch(0.66_0.14_358.91)]/25'
                            : 'bg-white text-[oklch(0.55_0.06_15)] border-2 border-[oklch(0.84_0.04_10.35)]'
                        }`}
                      >
                        {item.number}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isCompleted || isActive
                            ? 'text-[oklch(0.66_0.14_358.91)]'
                            : 'text-[oklch(0.55_0.06_15)]'
                        }`}
                      >
                        {item.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <AnimatePresence mode="wait">
              {step === 'phone' && (
                <motion.section
                  key="phone"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow"
                >
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      goToNext();
                    }}
                    className="space-y-4"
                  >
                    <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)]">
                      Enter your email address
                    </h3>

                    <div className="space-y-2">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError(null);
                        }}
                        className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm text-[oklch(0.39_0.09_17.83)] placeholder-[oklch(0.7_0.04_12)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/30 focus:border-[oklch(0.66_0.14_358.91)] transition-all"
                        placeholder="you@example.com"
                      />
                      {emailError && (
                        <p className="text-xs text-red-600">{emailError}</p>
                      )}
                    </div>

                    <div className="gap-3 flex sm:items-center justify-between flex-col">
                      <p className="text-xs text-[oklch(0.55_0.06_15)]">
                        {authMode === 'password'
                          ? 'Proceed to enter your password.'
                          : "We'll send you a one-time password (OTP)."}
                      </p>
                      <button
                        type="submit"
                        disabled={!isValidEmail || isContinueLoading}
                        className={`relative inline-flex min-w-40 justify-center rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                          isValidEmail && !isContinueLoading
                            ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                            : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                        }`}
                      >
                        <span className={isContinueLoading ? 'opacity-0' : ''}>Continue</span>
                        {isContinueLoading && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Spinner className="text-white" />
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.section>
              )}

              {step === 'otp' && (
                <motion.section
                  key="otp"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white/90 backdrop-blur-sm p-6 shadow"
                >
                  {authMode === 'password' ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handlePasswordLogin();
                      }}
                    >
                      <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-3">
                        Enter your password
                      </h3>
                      {error && (
                        <p className="mb-2 text-xs text-red-600">{error}</p>
                      )}
                      <div className="relative mb-2">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Your password"
                          className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-2 flex items-center text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)]"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStep('phone')}
                          className="text-sm text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)] transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={!isValidPassword || isPasswordLoading}
                          className={`relative inline-flex min-w-32 justify-center rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                            isValidPassword && !isPasswordLoading
                              ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                              : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                          }`}
                        >
                          <span className={isPasswordLoading ? 'opacity-0' : ''}>Login</span>
                          {isPasswordLoading && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Spinner className="text-white" />
                            </span>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handleVerify();
                      }}
                    >
                      <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-3">
                        Verify your email
                      </h3>
                      <p className="text-sm text-[oklch(0.55_0.06_15)] mb-6">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-semibold text-[oklch(0.66_0.14_358.91)]">
                          {email}
                        </span>
                      </p>

                      <div className="flex  gap-2.5 mb-3">
                        {otp.map((d, i) => (
                          <input
                            key={i}
                            ref={el => {
                              inputsRef.current[i] = el;
                            }}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onPaste={handleOtpPaste}
                            maxLength={1}
                            value={d}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            className="
        aspect-square
        w-8 md:w-12 lg:w-14
        text-center rounded-lg border
        border-[oklch(0.84_0.04_10.35)]
        bg-white text-base font-semibold
        text-[oklch(0.39_0.09_17.83)]
        focus:outline-none focus:ring-2
        focus:ring-[oklch(0.66_0.14_358.91)]/30
        focus:border-[oklch(0.66_0.14_358.91)]
        transition-all
        hover:border-[oklch(0.66_0.14_358.91)]/50
      "
                          />
                        ))}
                      </div>
                      {otpError && (
                        <p className="text-xs text-red-600 mb-3">{otpError}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStep('phone')}
                          className="text-sm text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)] transition-colors"
                        >
                          Back
                        </button>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            disabled={resendInSec > 0 || isOtpLoading}
                            onClick={() => requestLoginOtp()}
                            className={`text-sm transition-colors ${
                              resendInSec > 0 || isOtpLoading
                                ? 'text-[oklch(0.7_0.04_12)] cursor-not-allowed'
                                : 'text-[oklch(0.66_0.14_358.91)] hover:text-[oklch(0.58_0.16_8)]'
                            }`}
                          >
                            {resendInSec > 0
                              ? `Resend in 00:${String(resendInSec).padStart(2, '0')}`
                              : 'Resend OTP'}
                          </button>
                          <button
                            type="submit"
                            disabled={!isValidOtp || isOtpLoading}
                            className={`relative inline-flex min-w-28 justify-center rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                              isValidOtp && !isOtpLoading
                                ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                                : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                            }`}
                          >
                            <span className={isOtpLoading ? 'opacity-0' : ''}>Verify</span>
                            {isOtpLoading && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Spinner className="text-white" />
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            {step === 'done' && (
              <motion.section
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white p-8 text-center shadow"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">✓</span>
                </div>
                <h2 className="text-xl font-semibold text-[oklch(0.39_0.09_17.83)] mb-1">
                  Welcome back
                </h2>
                <p className="text-sm text-[oklch(0.55_0.06_15)] mb-6">
                  You are signed in.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href="/"
                    className="rounded-lg bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] px-4 py-2.5 text-white text-sm font-medium hover:shadow-md transition-all"
                  >
                    Go to Home
                  </Link>
                  <Link
                    href="/account/profile"
                    className="rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-4 py-2.5 text-sm text-[oklch(0.55_0.06_15)] hover:bg-[oklch(0.93_0.03_12.01)] transition-all"
                  >
                    Manage Account
                  </Link>
                </div>
              </motion.section>
            )}
            {step !== 'done' ? (
              <p className="mt-8 text-center text-sm text-[oklch(0.55_0.06_15)]">
                Don’t have an account?{' '}
                <Link
                  className="text-[oklch(0.66_0.14_358.91)] hover:text-[oklch(0.58_0.16_8)] font-medium transition-colors"
                  href="/signup"
                >
                  Create one
                </Link>
              </p>
            ) : (
              ''
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
