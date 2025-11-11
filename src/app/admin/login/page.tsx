'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from '@/app/(main)/components/layouts/Container';
import { useAdminAuth } from '@/lib/data/store/adminAuth';

export default function AdminLoginPage() {
  type Step = 'email' | 'otp' | 'done';

  const router = useRouter();
  const {
    email: storeEmail,
    setEmail,
    requestOtp,
    resendOtp,
    verifyOtp,
    requestStatus,
    verifyStatus,
    resendInSec,
    devOtp,
    loadProfile,
    profile,
  } = useAdminAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmailLocal] = useState(storeEmail);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // Check if user is already authenticated
    loadProfile().then(() => {
      const currentProfile = useAdminAuth.getState().profile;
      if (currentProfile) {
        // User is already logged in, redirect to dashboard
        router.push('/admin');
      } else {
        // No profile - ensure we're on email step
        setStep('email');
      }
    });
  }, [loadProfile, router]);

  // Reset step to email if profile becomes null (e.g., after logout)
  useEffect(() => {
    if (!profile && step === 'done') {
      setStep('email');
    }
  }, [profile, step]);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );
  const combinedOtp = useMemo(() => otp.join(''), [otp]);
  const isValidOtp = useMemo(() => /^\d{6}$/.test(combinedOtp), [combinedOtp]);

  // Stepper
  const stepItems = [
    { key: 'email' as const, label: 'Email', number: 1 },
    { key: 'otp' as const, label: 'OTP', number: 2 },
  ];
  const currentStepIndex =
    step === 'done'
      ? stepItems.length - 1
      : stepItems.findIndex(s => s.key === step);
  // Calculate progress: when on OTP step, show 100% progress (both steps completed visually)
  const progressPercent =
    step === 'done' || step === 'otp'
      ? 100
      : (currentStepIndex / (stepItems.length - 1)) * 100;

  useEffect(() => {
    if (step === 'otp') inputsRef.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    // Only set to done if verifyStatus is success AND we have a valid profile
    if (verifyStatus === 'success' && profile) {
      setStep('done');
      const t = setTimeout(() => router.push('/admin'), 800);
      return () => clearTimeout(t);
    }
    // If verifyStatus is success but no profile, reset to email step
    if (verifyStatus === 'success' && !profile) {
      setStep('email');
    }
  }, [verifyStatus, profile, router]);

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

  const handleSendOtp = async () => {
    if (!isValidEmail) return;
    setEmail(email);
    await requestOtp();
    setStep('otp');
  };

  const handleVerify = async () => {
    if (!isValidOtp) return;
    await verifyOtp(combinedOtp);
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, otp.length);
    if (!pasted) return;

    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);

    // Focus the last filled input
    const lastIndex = Math.min(pasted.length - 1, otp.length - 1);
    inputsRef.current[lastIndex]?.focus();
  };

  useEffect(() => {
    // Disable scrollbar on login page
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <main className="overflow-hidden h-screen">
      <Container>
        <div className="py-5 mt-10">
          <div className="max-w-xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-heading bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent mb-1.5">
                Admin Login
              </h1>
              <p className="text-sm text-[oklch(0.55_0.06_15)] dark:text-[#bdbdbd] font-light">
                Sign in securely with your admin email and OTP.
              </p>
            </div>

            {/* Stepper */}
            <div className="mb-6 rounded-xl border border-[oklch(0.84_0.04_10.35)]/50 dark:border-[#525252] bg-white/80 dark:bg-[#191919]/80 backdrop-blur-sm px-4 py-3 shadow">
              <ol className="relative flex items-center justify-between">
                <div className="absolute left-5 right-5 top-2">
                  <div className="h-px w-full bg-[oklch(0.84_0.04_10.35)]/40 dark:bg-[#525252]/40 rounded-full" />
                  <div
                    className="h-px bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] via-[oklch(0.62_0.15_3)] to-[oklch(0.58_0.16_8)] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {stepItems.map((item, index) => {
                  // Mark previous steps as completed
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
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white shadow-md'
                            : isActive
                            ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white shadow-lg scale-110 ring-2 ring-[oklch(0.66_0.14_358.91)]/25'
                            : 'bg-white dark:bg-[#242424] text-[oklch(0.55_0.06_15)] dark:text-gray-300 border-2 border-[oklch(0.84_0.04_10.35)] dark:border-[#525252]'
                        }`}
                      >
                        {item.number}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isCompleted || isActive
                            ? 'text-[oklch(0.66_0.14_358.91)] dark:text-primary-400'
                            : 'text-[oklch(0.55_0.06_15)] dark:text-[#bdbdbd]'
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
                  className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 dark:border-[#525252] bg-white/90 dark:bg-[#191919]/90 backdrop-blur-sm p-6 shadow"
                >
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendOtp();
                    }}
                    className="space-y-4"
                  >
                    <h3 className="text/base font-medium text-[oklch(0.39_0.09_17.83)] dark:text-white">
                      Enter your admin email
                    </h3>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmailLocal(e.target.value)}
                      className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] dark:border-[#525252] bg-white dark:bg-[#242424] px-3 py-2 text-sm text-[oklch(0.39_0.09_17.83)] dark:text-white placeholder-[oklch(0.7_0.04_12)] dark:placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/30 dark:focus:ring-primary-500/30 focus:border-[oklch(0.66_0.14_358.91)] dark:focus:border-primary-500 transition-all"
                      placeholder="admin@example.com"
                    />
                    <div className="mt-2 flex justify-between items-center">
                      {requestStatus === 'error' && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Failed to send OTP
                        </span>
                      )}
                      <div className="ml-auto">
                        <button
                          type="submit"
                          disabled={!isValidEmail || requestStatus === 'loading'}
                          className={`rounded-lg px-4 py-2.5 min-w-40 text-white text-sm font-medium transition-all duration-200 ${
                            isValidEmail && requestStatus !== 'loading'
                              ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                              : 'bg-[oklch(0.84_0.04_10.35)] dark:bg-[#525252] cursor-not-allowed'
                          }`}
                        >
                          {requestStatus === 'loading' ? 'Sending…' : 'Send OTP'}
                        </button>
                      </div>
                    </div>
                    {devOtp && process.env.NODE_ENV !== 'production' && (
                      <p className="text-xs text-[oklch(0.55_0.06_15)] dark:text-[#bdbdbd]">
                        Dev OTP: {devOtp}
                      </p>
                    )}
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
                  className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 dark:border-[#525252] bg-white/90 dark:bg-[#191919]/90 backdrop-blur-sm p-6 shadow"
                >
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleVerify();
                    }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] dark:text-white mb-3">
                        Verify your email
                      </h3>
                      <p className="text-sm text-[oklch(0.55_0.06_15)] dark:text-[#bdbdbd]">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-semibold text-[oklch(0.66_0.14_358.91)] dark:text-primary-400">
                          {storeEmail || email}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 justify-center">
                      {otp.map((d, i) => (
                        <input
                          key={i}
                          ref={el => {
                            inputsRef.current[i] = el;
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={d}
                          onPaste={handleOtpPaste}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="aspect-square w-9 sm:w-10 md:w-12 text-center rounded-lg border border-[oklch(0.84_0.04_10.35)] dark:border-[#525252] bg-white dark:bg-[#242424] text-sm sm:text-base font-semibold text-[oklch(0.39_0.09_17.83)] dark:text-white focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/30 dark:focus:ring-primary-500/30 focus:border-[oklch(0.66_0.14_358.91)] dark:focus:border-primary-500 transition-all hover:border-[oklch(0.66_0.14_358.91)]/50 dark:hover:border-primary-500/50 flex-shrink-0"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="text-sm text-[oklch(0.55_0.06_15)] dark:text-[#bdbdbd] hover:text-[oklch(0.66_0.14_358.91)] dark:hover:text-primary-400 transition-colors"
                      >
                        Back
                      </button>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          disabled={resendInSec > 0}
                          onClick={() => resendOtp()}
                          className={`text-sm transition-colors ${
                            resendInSec > 0
                              ? 'text-[oklch(0.7_0.04_12)] dark:text-[#525252] cursor-not-allowed'
                              : 'text-[oklch(0.66_0.14_358.91)] dark:text-primary-400 hover:text-[oklch(0.58_0.16_8)] dark:hover:text-primary-500'
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
                          disabled={!isValidOtp || verifyStatus === 'loading'}
                          className={`rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                            isValidOtp && verifyStatus !== 'loading'
                              ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                              : 'bg-[oklch(0.84_0.04_10.35)] dark:bg-[#525252] cursor-not-allowed'
                          }`}
                        >
                          {verifyStatus === 'loading' ? 'Verifying…' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.section>
              )}
            </AnimatePresence>

            {step === 'done' && (
              <motion.section
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 dark:border-[#525252] bg-white dark:bg-[#191919] p-8 text-center shadow"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">✓</span>
                </div>
                <h2 className="text-xl font-semibold text-[oklch(0.39_0.09_17.83)] dark:text-white mb-1">
                  Welcome Admin
                </h2>
                <p className="text-sm text-[oklch(0.55_0.06_15)] dark:text-[#bdbdbd] mb-6">
                  You are signed in securely.
                </p>
                <Link
                  href="/admin"
                  className="rounded-lg bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] px-4 py-2.5 text-white text-sm font-medium hover:shadow-md transition-all"
                >
                  Go to Admin Dashboard
                </Link>
              </motion.section>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
