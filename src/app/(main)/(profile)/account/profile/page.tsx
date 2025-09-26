'use client';

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  Suspense,
} from 'react';
import {
  User,
  Bell,
  Shield,
  Heart,
  ShoppingBag,
  Star,
  Check,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomDropdown from '@/app/(main)/components/ui/customDropdown';

function AccountPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'preferences' | 'privacy' | 'activity'
  >('profile');

  // Profile States
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+1234567890');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [dob, setDob] = useState('1990-01-15');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [occupation, setOccupation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  // Preferences States
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(true);
  const [language, setLanguage] = useState('en');

  // Privacy & Security States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Orders preview for stats and recent list
  const [ordersPreview, setOrdersPreview] = useState<
    Array<{
      _id: string;
      orderNumber?: string;
      totalAmount?: number;
      orderStatus?: string;
      createdAt?: string;
    }>
  >([]);

  // API response type for orders list
  type ApiOrder = {
    _id?: string;
    orderNumber?: string;
    totalAmount?: number;
    orderStatus?: string;
    createdAt?: string;
  };

  const snapshot = useCallback(
    () => ({
      name,
      phone,
      gender,
      dob,
      bio,
      website,
      occupation,
      interests,
      newsletterOptIn,
      smsNotifications,
      emailNotifications,
      orderUpdates,
      promotionalEmails,
      language,
      twoFactorEnabled,
    }),
    [
      name,
      phone,
      gender,
      dob,
      bio,
      website,
      occupation,
      interests,
      newsletterOptIn,
      smsNotifications,
      emailNotifications,
      orderUpdates,
      promotionalEmails,
      language,
      twoFactorEnabled,
    ]
  );

  // initial snapshot to detect dirty
  type SnapshotType = ReturnType<typeof snapshot> | null;
  const initialSnapshotRef = React.useRef<SnapshotType>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/account/me', { cache: 'no-store' });
        const data = await res.json();
        const u = data?.user;
        if (u) {
          setName(u.name || '');
          setEmail(u.email || '');
          const p = u.profile || {};
          const nextPhone = p.phone || '';
          const nextGender = p.gender || 'prefer_not_to_say';
          const nextDob = p.dob
            ? new Date(p.dob).toISOString().slice(0, 10)
            : '';
          const nextBio = p.bio || '';
          const nextWebsite = p.website || '';
          const nextOccupation = p.occupation || '';
          const nextInterests = Array.isArray(p.interests) ? p.interests : [];

          const nextNewsletterOptIn = !!p.newsletterOptIn;
          const nextSmsNotifications = !!p.smsNotifications;
          const nextEmailNotifications = !!p.emailNotifications;
          const nextOrderUpdates = !!p.orderUpdates;
          const nextPromotionalEmails = !!p.promotionalEmails;
          const nextLanguage = p.language || 'en';
          const nextTwoFactorEnabled = !!p.twoFactorEnabled;

          setPhone(nextPhone);
          setGender(nextGender);
          setDob(nextDob);
          setBio(nextBio);
          setWebsite(nextWebsite);
          setOccupation(nextOccupation);
          setInterests(nextInterests);

          setNewsletterOptIn(nextNewsletterOptIn);
          setSmsNotifications(nextSmsNotifications);
          setEmailNotifications(nextEmailNotifications);
          setOrderUpdates(nextOrderUpdates);
          setPromotionalEmails(nextPromotionalEmails);
          setLanguage(nextLanguage);
          setTwoFactorEnabled(nextTwoFactorEnabled);

          // take snapshot directly from fetched values to avoid dependency on `snapshot`
          initialSnapshotRef.current = {
            name: u.name || '',
            phone: nextPhone,
            gender: nextGender,
            dob: nextDob,
            bio: nextBio,
            website: nextWebsite,
            occupation: nextOccupation,
            interests: nextInterests,
            newsletterOptIn: nextNewsletterOptIn,
            smsNotifications: nextSmsNotifications,
            emailNotifications: nextEmailNotifications,
            orderUpdates: nextOrderUpdates,
            promotionalEmails: nextPromotionalEmails,
            language: nextLanguage,
            twoFactorEnabled: nextTwoFactorEnabled,
          };
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch orders preview for stats and recent list
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/orders', { credentials: 'include' });
        const data = (await res.json()) as { orders?: ApiOrder[] };
        const list: ApiOrder[] = data?.orders || [];
        const normalized = list.map((o: ApiOrder) => ({
          _id: String(o._id || ''),
          orderNumber: o.orderNumber || o._id,
          totalAmount: o.totalAmount || 0,
          orderStatus: o.orderStatus || 'pending',
          createdAt: o.createdAt,
        }));
        setOrdersPreview(normalized);
      } catch {
        setOrdersPreview([]);
      }
    })();
  }, []);

  // pick tab from query
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (
      tab === 'preferences' ||
      tab === 'privacy' ||
      tab === 'activity' ||
      tab === 'profile'
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const isDirty = useMemo(() => {
    if (!initialSnapshotRef.current) return false;
    const now = snapshot();
    const a = initialSnapshotRef.current;
    // simple shallow compare for primitives/arrays
    const keys = Object.keys(now) as (keyof typeof now)[];
    for (const k of keys) {
      const v1 = a[k];
      const v2 = now[k];
      if (Array.isArray(v1) && Array.isArray(v2)) {
        if (v1.length !== v2.length) return true;
        for (let i = 0; i < v1.length; i++) if (v1[i] !== v2[i]) return true;
      } else if (v1 !== v2) return true;
    }
    return false;
  }, [snapshot]);

  const canSave = useMemo(
    () => name.trim().length > 0 && isDirty,
    [name, isDirty]
  );

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (!canSave) return;
    setSaving(true);

    try {
      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          gender,
          dob,
          occupation,
          bio,
          website,
          interests,
          newsletterOptIn,
          smsNotifications,
          emailNotifications,
          orderUpdates,
          promotionalEmails,
          language,
          twoFactorEnabled,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Profile updated successfully!');
      // reset snapshot to new state
      initialSnapshotRef.current = snapshot();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save changes';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!initialSnapshotRef.current) return;
    const a = initialSnapshotRef.current;
    setName(a.name);
    setPhone(a.phone);
    setGender(a.gender);
    setDob(a.dob);
    setBio(a.bio);
    setWebsite(a.website);
    setOccupation(a.occupation);
    setInterests(a.interests);

    setNewsletterOptIn(a.newsletterOptIn);
    setSmsNotifications(a.smsNotifications);
    setEmailNotifications(a.emailNotifications);
    setOrderUpdates(a.orderUpdates);
    setPromotionalEmails(a.promotionalEmails);
    setLanguage(a.language);
    setTwoFactorEnabled(a.twoFactorEnabled);

    setError(null);
    setSuccess(null);
  };

  const genderOptions = [
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: ShoppingBag },
  ] as const;

  if (loading) {
    return (
      <main className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="lg:col-span-3 h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl  bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent mb-2 font-medium font-heading">
            My Account
          </h1>
          <p className="text-gray-600">
            Manage your profile, preferences, and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 p-6 shadow-sm">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] flex items-center justify-center text-white text-2xl font-medium font-heading">
                    {name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="text-sm text-gray-500">{email}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">Premium Member</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 p-2 shadow-sm">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      const url = new URL(window.location.href);
                      url.searchParams.set('tab', tab.id);
                      router.push(
                        `${url.pathname}?${url.searchParams.toString()}`
                      );
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/10 to-[oklch(0.58_0.16_8)]/10 text-[oklch(0.66_0.14_358.91)] font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats (dynamic) */}
            <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Orders</span>
                  </div>
                  <span className="font-semibold">{ordersPreview.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Favorites</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-[oklch(0.66_0.14_358.91)]" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Profile Information
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              value={email}
                              readOnly
                              className="w-full rounded-xl border bg-gray-50 px-10 py-3 text-sm text-gray-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              value={phone}
                              onChange={e =>
                                setPhone(
                                  e.target.value.replace(/\D/g, '').slice(0, 15)
                                )
                              }
                              className="w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-10 py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors"
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>

                        <CustomDropdown
                          label="Gender"
                          value={gender}
                          onChange={setGender}
                          options={genderOptions}
                        />

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="date"
                              value={dob}
                              onChange={e => setDob(e.target.value)}
                              className="w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-10 py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          Recent Orders
                        </h3>
                        <button
                          onClick={() => router.push('/orders/history')}
                          className="text-sm text-[oklch(0.66_0.14_358.91)] hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      <div className="space-y-3">
                        {ordersPreview.slice(0, 3).map(o => (
                          <div
                            key={o._id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {o.orderNumber}
                              </p>
                              <p className="text-sm text-gray-500">
                                {o.createdAt
                                  ? new Date(o.createdAt).toLocaleDateString()
                                  : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ₹{(o.totalAmount || 0).toLocaleString()}
                              </p>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {o.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                        {ordersPreview.length === 0 && (
                          <div className="text-sm text-gray-500">
                            No recent orders.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-6 h-6 text-[oklch(0.66_0.14_358.91)]" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Preferences
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {/* Notifications */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            label: 'Email Notifications',
                            state: emailNotifications,
                            setState: setEmailNotifications,
                            description: 'Receive general email notifications',
                          },
                          {
                            label: 'SMS Notifications',
                            state: smsNotifications,
                            setState: setSmsNotifications,
                            description: 'Receive SMS updates on your phone',
                          },
                          {
                            label: 'Order Updates',
                            state: orderUpdates,
                            setState: setOrderUpdates,
                            description:
                              'Get notified about order status changes',
                          },
                          {
                            label: 'Promotional Emails',
                            state: promotionalEmails,
                            setState: setPromotionalEmails,
                            description: 'Receive promotional offers and deals',
                          },
                          {
                            label: 'Newsletter',
                            state: newsletterOptIn,
                            setState: setNewsletterOptIn,
                            description: 'Subscribe to our newsletter',
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between p-4 bg-gray-50 rounded-xl"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.label}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {item.description}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.state}
                                onChange={e => item.setState(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[oklch(0.66_0.14_358.91)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[oklch(0.66_0.14_358.91)] peer-checked:to-[oklch(0.58_0.16_8)]"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Language & Region */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Language & Region
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomDropdown
                          label="Language"
                          value={language}
                          onChange={setLanguage}
                          options={languageOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Security Tab */}
              {activeTab === 'privacy' && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-[oklch(0.66_0.14_358.91)]" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Privacy & Security
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {/* Security */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Security
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Two-Factor Authentication
                            </h4>
                            <p className="text-sm text-gray-600">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all">
                            {twoFactorEnabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>

                        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Change Password
                            </h4>
                            <p className="text-sm text-gray-600">
                              Update your password regularly for better security
                            </p>
                          </div>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                            Change
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <ShoppingBag className="w-6 h-6 text-[oklch(0.66_0.14_358.91)]" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Activity Overview
                    </h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Recent Orders
                      </h3>
                      <div className="space-y-3">
                        {ordersPreview.slice(0, 5).map(o => (
                          <div
                            key={o._id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {o.orderNumber}
                              </p>
                              <p className="text-sm text-gray-500">
                                {o.createdAt
                                  ? new Date(o.createdAt).toLocaleDateString()
                                  : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ₹{(o.totalAmount || 0).toLocaleString()}
                              </p>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {o.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                        {ordersPreview.length === 0 && (
                          <div className="text-sm text-gray-500">
                            No recent orders.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isDirty &&
                (activeTab === 'profile' || activeTab === 'preferences') && (
                  <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleSave}
                        disabled={!canSave || saving}
                        className={`px-6 py-3 text-white text-sm font-medium rounded-xl transition-all ${
                          !canSave || saving
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:shadow-[oklch(0.66_0.14_358.91)]/25'
                        }`}
                      >
                        {saving ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </button>

                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>

                      {error && (
                        <div className="flex items-center gap-2 text-red-600">
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                          <p className="text-sm">{error}</p>
                        </div>
                      )}

                      {success && (
                        <div className="flex items-center gap-2 text-green-700">
                          <Check className="w-4 h-4" />
                          <p className="text-sm">{success}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div />}>
      <AccountPageInner />
    </Suspense>
  );
}
