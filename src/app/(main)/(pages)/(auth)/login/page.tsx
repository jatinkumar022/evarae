'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/app/(main)/components/layouts/Container';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  type Step = 'phone' | 'otp' | 'done';

  const [step, setStep] = useState<Step>('phone');
  // Temporarily force email mode only
  // const mode: 'email' = 'email';
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  // const [phone, setPhone] = useState(''); // disabled mobile
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resendIn, setResendIn] = useState(30);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // const isValidPhone = useMemo(() => /^\d{10}$/.test(phone), [phone]); // disabled mobile
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

  useEffect(() => {
    if (!(step === 'otp' && authMode === 'otp')) return;
    setResendIn(30);
    const id = setInterval(
      () => setResendIn(prev => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, [step, authMode]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < otp.length - 1) inputsRef.current[index + 1]?.focus();
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
  };

  const goToNext = () => {
    if (!isValidEmail) return;
    setStep('otp');
  };

  const handlePasswordLogin = async () => {
    if (!isValidPassword) return;
    await new Promise(r => setTimeout(r, 600));
    setStep('done');
  };

  const handleVerify = async () => {
    if (!isValidOtp) return;
    await new Promise(r => setTimeout(r, 600));
    setStep('done');
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
                  <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-4">
                    Enter your email address
                  </h3>

                  <div className="space-y-2">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm text-[oklch(0.39_0.09_17.83)] placeholder-[oklch(0.7_0.04_12)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/30 focus:border-[oklch(0.66_0.14_358.91)] transition-all"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="gap-3 mt-3 flex sm:items-center justify-between flex-col">
                    <p className="text-xs text-[oklch(0.55_0.06_15)]">
                      {authMode === 'password'
                        ? 'Proceed to enter your password.'
                        : "We'll send you a one-time password (OTP)."}
                    </p>
                    <button
                      onClick={goToNext}
                      disabled={!isValidEmail}
                      className={`rounded-lg px-4 py-2.5 min-w-40 text-white text-sm font-medium transition-all duration-200 ${
                        isValidEmail
                          ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                          : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                      }`}
                    >
                      Continue
                    </button>
                  </div>
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
                    <div>
                      <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-3">
                        Enter your password
                      </h3>
                      <div className="relative mb-4">
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
                          onClick={() => setStep('phone')}
                          className="text-sm text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)] transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePasswordLogin}
                          disabled={!isValidPassword}
                          className={`rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                            isValidPassword
                              ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                              : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                          }`}
                        >
                          Login
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-3">
                        Verify your email
                      </h3>
                      <p className="text-sm text-[oklch(0.55_0.06_15)] mb-6">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-semibold text-[oklch(0.66_0.14_358.91)]">
                          {email}
                        </span>
                      </p>

                      <div className="flex  gap-2.5 mb-6">
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

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setStep('phone')}
                          className="text-sm text-[oklch(0.55_0.06_15)] hover:text-[oklch(0.66_0.14_358.91)] transition-colors"
                        >
                          Back
                        </button>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            disabled={resendIn > 0}
                            onClick={() => setResendIn(30)}
                            className={`text-sm transition-colors ${
                              resendIn > 0
                                ? 'text-[oklch(0.7_0.04_12)] cursor-not-allowed'
                                : 'text-[oklch(0.66_0.14_358.91)] hover:text-[oklch(0.58_0.16_8)]'
                            }`}
                          >
                            {resendIn > 0
                              ? `Resend in 00:${String(resendIn).padStart(
                                  2,
                                  '0'
                                )}`
                              : 'Resend OTP'}
                          </button>
                          <button
                            onClick={handleVerify}
                            disabled={!isValidOtp}
                            className={`rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all duration-200 ${
                              isValidOtp
                                ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:scale-105 shadow-md'
                                : 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                            }`}
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    </div>
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
                    href="/account"
                    className="rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-4 py-2.5 text-sm text-[oklch(0.55_0.06_15)] hover:bg-[oklch(0.93_0.03_12.01)] transition-all"
                  >
                    Manage Account
                  </Link>
                </div>
              </motion.section>
            )}

            <p className="mt-8 text-center text-sm text-[oklch(0.55_0.06_15)]">
              Don’t have an account?{' '}
              <Link
                className="text-[oklch(0.66_0.14_358.91)] hover:text-[oklch(0.58_0.16_8)] font-medium transition-colors"
                href="/signup"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
