'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/app/(main)/components/layouts/Container';
import { Eye, EyeOff } from 'lucide-react';
import { useUserAuth } from '@/lib/data/mainStore/userAuth';
import { Spinner } from '@/app/(main)/components/ui/ScaleLoader';
import { useUserAccountStore } from '@/lib/data/mainStore/userAccountStore';

export default function SignupPage() {
  type Step = 'email' | 'auth' | 'details' | 'done';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const {
    setEmail: setStoreEmail,
    requestSignupOtp,
    verifySignupOtp,
    resendInSec,
  } = useUserAuth();
  const hydrateAccount = useUserAccountStore(state => state.hydrate);
  const refreshAccount = useUserAccountStore(state => state.refresh);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );
  const combinedOtp = useMemo(() => otp.join(''), [otp]);
  const isValidOtp = useMemo(() => /^\d{6}$/.test(combinedOtp), [combinedOtp]);
  const isValidPassword = useMemo(
    () => password.length >= 6 && password === confirmPassword,
    [password, confirmPassword]
  );

  // Stepper items
  const stepItems = [
    { key: 'email', label: 'Email', number: 1 },
    { key: 'auth', label: 'Verify', number: 2 },
    { key: 'details', label: 'Details', number: 3 },
  ] as const;
  const rawIndex =
    step === 'done'
      ? stepItems.length - 1
      : stepItems.findIndex(s => s.key === step);
  const currentStepIndex = Math.max(0, rawIndex);
  const progressPercent = (currentStepIndex / (stepItems.length - 1)) * 100;

  useEffect(() => {
    if (step === 'auth') {
      inputsRef.current[0]?.focus();
    }
  }, [step]);

  // resend cooldown is handled by user auth store

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
        completeAuth();
      }
    }
  };

  const goToAuth = async () => {
    if (!isValidEmail || isEmailLoading) return;
    setStoreEmail(email);
    setIsEmailLoading(true);
    try {
      setEmailError(null);
      const { userAuthApi } = await import('@/lib/utils');
      const { exists } = await userAuthApi.checkEmail(email);
      if (exists) {
        setEmailError(
          'This email is already registered. Please login instead.'
        );
        return;
      }
      await requestSignupOtp();
      setStep('auth');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to send OTP';
      setEmailError(message);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const completeAuth = async () => {
    if (!isValidOtp || isOtpLoading) return;
    try {
      setIsOtpLoading(true);
      setOtpError(null);
      await verifySignupOtp(otp.join(''));
      setStep('details');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid OTP';
      setOtpError(message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const extractPhoneDigits = (value: string) => value.replace(/\D/g, '');

  const normalizePhoneInput = (value: string) => {
    const digitsOnly = extractPhoneDigits(value);
    if (!digitsOnly) return '';

    if (digitsOnly.length > 10) {
      return digitsOnly.slice(-10);
    }

    return digitsOnly;
  };

  const normalizePhoneForSubmit = (value: string) => {
    const digitsOnly = normalizePhoneInput(value);
    if (!digitsOnly) return '';
    return digitsOnly;
  };

  const handlePhoneChange = (value: string) => {
    const normalized = normalizePhoneInput(value);
    setPhone(normalized);
    setPhoneError(null);
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardText = e.clipboardData?.getData('text');
    if (clipboardText) {
      e.preventDefault();
      setPhone(normalizePhoneInput(clipboardText));
      setPhoneError(null);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
      e.preventDefault();
      navigator.clipboard
        .readText()
        .then(text => {
          if (!text) return;
          setPhone(normalizePhoneInput(text));
          setPhoneError(null);
        })
        .catch(() => {
          // Ignore errors – allow user to paste manually
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPhone = normalizePhoneForSubmit(phone);
    
    const isValidPhone = /^[6-9]\d{9}$/.test(normalizedPhone);

    if (
      !fullName.trim() ||
      !isValidPhone ||
      normalizedPhone.length !== 10 ||
      isSubmitting ||
      phoneError
    ) {
      if (normalizedPhone.length !== 10) {
        setPhoneError('Mobile number must be 10 digits');
      } else if (!isValidPhone) {
        setPhoneError('Please enter a valid 10-digit Indian mobile number');
      }
      return;
    }
    
    setIsSubmitting(true);
    setPhoneError(null);
    try {
      const { userAuthApi } = await import('@/lib/utils');
        const res = await userAuthApi.completeProfile(
          fullName.trim(),
          normalizedPhone,
          password
        );
        if (res.user) {
          hydrateAccount({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
          });
        }
        await refreshAccount();
      setStep('done');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to complete signup. Please try again.';
      if (errorMessage.includes('phone') || errorMessage.includes('mobile') || errorMessage.includes('already')) {
        setPhoneError('This mobile number is already registered. Please use a different number.');
      } else {
        setPhoneError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
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
                Create your account
              </h1>
              <p className="text-sm text-[oklch(0.55_0.06_15)] font-light">
                Sign up with email + OTP, then set your password.
              </p>
            </div>

            {/* Google Sign-In */}
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
                            : 'bg-white text-[oklch(0.55_0.06_15)] border-2 border-[oklch(0.84_0.04_10.35)] hover:border-[oklch(0.66_0.14_358.91)]/40'
                        }`}
                      >
                        {isCompleted && !isActive ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          item.number
                        )}
                      </span>
                      <span
                        className={`text-xs font-medium transition-colors ${
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
              {step === 'email' && (
                <motion.section
                  key="email"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white/90 backdrop-blur-sm p-4 sm:p-6 shadow"
                >
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      goToAuth();
                    }}
                    className="space-y-4"
                  >
                    <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)]">
                      Enter your email
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
                    <div className="gap-3 flex sm:items-center justify-end">
                      <button
                        type="submit"
                        disabled={!isValidEmail || isEmailLoading}
                        className={`relative inline-flex min-w-40 justify-center rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                          isValidEmail && !isEmailLoading
                            ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                            : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                        }`}
                      >
                        <span className={isEmailLoading ? 'opacity-0' : ''}>Continue</span>
                        {isEmailLoading && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Spinner className="text-white" />
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.section>
              )}

              {step === 'auth' && (
                <motion.section
                  key="auth"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white/90 backdrop-blur-sm p-6 shadow"
                >
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      completeAuth();
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)]">
                        Verify your email
                      </h3>
                    </div>

                    <div>
                      <p className="text-sm text-[oklch(0.55_0.06_15)] mb-4">
                        Enter the 6-digit code sent to
                        <span className="font-semibold text-[oklch(0.66_0.14_358.91)]">
                          {' '}
                          {email}
                        </span>
                      </p>
                      <div className="flex gap-2.5 mb-4 justify-center">
                        {otp.map((d, i) => (
                          <input
                            key={i}
                            ref={el => {
                              inputsRef.current[i] = el;
                            }}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            onPaste={handleOtpPaste}
                            value={d}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            className="aspect-square w-8 md:w-12 lg:w-14 text-center rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white text-base font-semibold"
                          />
                        ))}
                      </div>
                      {otpError && (
                        <p className="text-xs text-red-600 text-center mb-2">
                          {otpError}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStep('email')}
                          className="text-sm text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)]"
                        >
                          ← Back
                        </button>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            disabled={resendInSec > 0}
                            onClick={() => requestSignupOtp()}
                            className={`text-sm transition-colors ${
                              resendInSec > 0
                                ? 'text-[oklch(0.7_0.04_12)] cursor-not-allowed'
                                : 'text-[oklch(0.66_0.14_358.91)] hover:text-[oklch(0.58_0.16_8)]'
                            }`}
                          >
                            {resendInSec > 0
                              ? `Resend in 00:${String(resendInSec).padStart(
                                  2,
                                  '0'
                                )}`
                              : 'Resend OTP'}
                          </button>
                          <button
                            type="submit"
                            disabled={!isValidOtp || isOtpLoading}
                            className={`relative inline-flex min-w-32 justify-center rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                              isValidOtp && !isOtpLoading
                                ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                                : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                            }`}
                          >
                            <span className={isOtpLoading ? 'opacity-0' : ''}>Continue</span>
                            {isOtpLoading && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Spinner className="text-white" />
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </motion.section>
              )}

              {step === 'details' && (
                <motion.section
                  key="details"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white/90 backdrop-blur-sm p-6 shadow"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-4">
                      Complete your profile
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-[oklch(0.55_0.06_15)] mb-2">
                        Email
                      </label>
                      <input
                        value={email}
                        readOnly
                        className="w-full rounded-xl border border-[oklch(0.84_0.04_10.35)] bg-[oklch(0.93_0.03_12.01)] px-4 py-3 text-sm text-[oklch(0.55_0.06_15)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[oklch(0.55_0.06_15)] mb-2">
                        Mobile number
                      </label>
                      <input
                        value={phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        onPaste={handlePhonePaste}
                        onBlur={() => {
                          const cleaned = normalizePhoneInput(phone);
                          if (cleaned !== phone) {
                            setPhone(cleaned);
                          }
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter 10-digit mobile number"
                        className={`w-full rounded-xl border ${
                          phoneError
                            ? 'border-red-500'
                            : 'border-[oklch(0.84_0.04_10.35)]'
                        } bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                          phoneError
                            ? 'focus:ring-red-500/30 focus:border-red-500'
                            : 'focus:ring-[oklch(0.66_0.14_358.91)]/30 focus:border-[oklch(0.66_0.14_358.91)]'
                        } transition-all`}
                      />
                      {phoneError && (
                        <p className="text-xs text-red-600 mt-1.5">{phoneError}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-[oklch(0.55_0.06_15)] mb-2"
                      >
                        Full name
                      </label>
                      <input
                        id="fullName"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-[oklch(0.84_0.04_10.35)] bg-white px-4 py-3 text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create password (min 6 characters)"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
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
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute inset-y-0 right-2 flex items-center text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)]"
                        >
                          {showConfirm ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setStep('auth')}
                        className="text-sm text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)] transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          !fullName.trim() ||
                          !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').replace(/^0+/, '')) ||
                          !isValidPassword ||
                          !!phoneError
                        }
                        className={`relative inline-flex min-w-40 justify-center rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                          isSubmitting ||
                          !fullName.trim() ||
                          !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').replace(/^0+/, '')) ||
                          !isValidPassword ||
                          !!phoneError
                            ? 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                            : 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                        }`}
                      >
                        <span className={isSubmitting ? 'opacity-0' : ''}>Create account</span>
                        {isSubmitting && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Spinner className="text-white" />
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Success State */}
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
                  Welcome aboard
                </h2>
                <p className="text-sm text-[oklch(0.55_0.06_15)] mb-6">
                  You are signed in{fullName ? `, ${fullName}` : ''}.
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
                Already have an account?{' '}
                <Link
                  href={'/login'}
                  className="text-[oklch(0.66_0.14_358.91)] hover:text-[oklch(0.58_0.16_8)] font-medium transition-colors"
                >
                  Login
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
