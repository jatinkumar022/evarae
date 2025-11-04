'use client';

import React, { useEffect, useState, Suspense } from 'react';
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
import { Controller } from 'react-hook-form';
import CustomDropdown from '@/app/(main)/components/ui/customDropdown';
import CustomDatePicker from '@/app/(main)/components/ui/customDatePicker';
import { useProfileForm } from '@/app/(main)/hooks/useProfileForm';
import { useProfileData } from '@/app/(main)/hooks/useProfileData';

function AccountPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'preferences' | 'privacy' | 'activity' | 'stats'
  >('profile');

  // Fetch profile data
  const { profileData, email, ordersPreview, isLoading, setProfileData } =
    useProfileData();

  // Initialize form with profile data
  const { form, onSubmit, handleCancel, isDirty, isSubmitting, isValid } =
    useProfileForm({
      initialData: profileData,
      onSuccess: () => {
        // Update local profile data after successful save
        setProfileData(form.getValues());
      },
    });

  // Update form when profileData changes
  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      form.reset(profileData);
    }
  }, [profileData, form]);

  // Pick tab from query
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (
      tab === 'preferences' ||
      tab === 'privacy' ||
      tab === 'activity' ||
      tab === 'profile' ||
      tab === 'stats'
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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

  // Global loader will handle loading state

  return (
    <main className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl  bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent mb-1 sm:mb-2 font-medium font-heading">
            My Account
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your profile, preferences, and account settings
          </p>
        </div>

        {/* Profile Card - Visible on mobile only (outside sidebar) */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 p-4 sm:p-6 shadow-sm">
            <div className="text-center">
              <div className="relative inline-block mb-3 sm:mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] flex items-center justify-center text-white text-lg sm:text-2xl font-medium font-heading">
                  {((form.watch('name') as string) || 'User')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
              </div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900">
                {(form.watch('name') as string) || 'User'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">{email}</p>
            </div>
          </div>
        </div>

        {/* Mobile Top Tabs - Fixed below navbar, visible only on mobile */}
        <div className="lg:hidden sticky top-20 z-20 bg-white border-b border-[oklch(0.84_0.04_10.35)]/30 shadow-sm mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <nav className="flex items-center justify-start gap-1 overflow-x-auto py-2 scrollbar-hide">
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/10 to-[oklch(0.58_0.16_8)]/10 text-[oklch(0.66_0.14_358.91)] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[oklch(0.66_0.14_358.91)]' : 'text-gray-600'}`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
            {/* Stats Tab Button */}
            <button
              onClick={() => {
                setActiveTab('stats');
                const url = new URL(window.location.href);
                url.searchParams.set('tab', 'stats');
                router.push(
                  `${url.pathname}?${url.searchParams.toString()}`
                );
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/10 to-[oklch(0.58_0.16_8)]/10 text-[oklch(0.66_0.14_358.91)] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-4 h-4 ${activeTab === 'stats' ? 'text-[oklch(0.66_0.14_358.91)]' : 'text-gray-600'}`} />
              <span className="text-xs font-medium">Stats</span>
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block space-y-6">
            {/* Profile Card - Desktop only (in sidebar) */}
            <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 p-4 sm:p-6 shadow-sm">
              <div className="text-center">
                <div className="relative inline-block mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] flex items-center justify-center text-white text-lg sm:text-2xl font-medium font-heading">
                    {((form.watch('name') as string) || 'User')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-medium text-gray-900">
                  {(form.watch('name') as string) || 'User'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">{email}</p>
              </div>
            </div>

            {/* Navigation - Desktop only */}
            <nav className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 p-1.5 sm:p-2 shadow-sm">
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
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/10 to-[oklch(0.58_0.16_8)]/10 text-[oklch(0.66_0.14_358.91)] font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats (dynamic) - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 p-4 sm:p-6 shadow-sm">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Quick Stats</h4>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-xs sm:text-sm text-gray-600">Orders</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium">{ordersPreview.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                    <span className="text-xs sm:text-sm text-gray-600">Favorites</span>
                  </div>
                  <span className="text-sm sm:text-base font-medium">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Full width on mobile, 3/4 on desktop */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-[oklch(0.66_0.14_358.91)]" />
                    <h2 className="text-lg sm:text-xl font-medium text-gray-900">
                      Profile Information
                    </h2>
                  </div>

                  <form id="profile-form" onSubmit={onSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <div className="relative">
                                <input
                                  {...field}
                                  className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors ${
                                    fieldState.error
                                      ? 'border-red-300'
                                      : ''
                                  }`}
                                  placeholder="Enter your full name"
                                />
                                {fieldState.error && (
                                  <p className="text-xs text-red-600 mt-1.5 mb-1 relative z-10">
                                    {fieldState.error.message}
                                  </p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                            <input
                              value={email}
                              readOnly
                              className="w-full rounded-xl border bg-gray-50 px-10 py-2 sm:py-3 text-sm text-gray-600"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <Controller
                            name="phone"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <div className="relative">
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 z-10 pointer-events-none" />
                                  <input
                                    {...field}
                                    onChange={e => {
                                      const value = e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 10); // Limit to exactly 10 digits
                                      field.onChange(value);
                                    }}
                                    maxLength={10}
                                    className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-10 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors ${
                                      fieldState.error
                                        ? 'border-red-300'
                                        : ''
                                    }`}
                                    placeholder="Enter 10 digit phone number"
                                    autoComplete="tel"
                                    inputMode="numeric"
                                  />
                                </div>
                                {fieldState.error && (
                                  <div className="mt-1.5 mb-1 min-h-[20px]">
                                    <p className="text-xs text-red-600 relative z-20">
                                      {fieldState.error.message}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        <Controller
                          name="gender"
                          control={form.control}
                          render={({ field }) => (
                            <CustomDropdown
                              label="Gender"
                              value={field.value || 'prefer_not_to_say'}
                              onChange={field.onChange}
                              options={genderOptions}
                            />
                          )}
                        />

                        <Controller
                          name="dob"
                          control={form.control}
                          render={({ field }) => (
                            <CustomDatePicker
                              label="Date of Birth"
                              value={field.value || ''}
                              onChange={field.onChange}
                              maxDate={new Date().toISOString().split('T')[0]}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}

                      {/* Preferences Tab */}
                      {activeTab === 'preferences' && (
                        <form id="preferences-form" onSubmit={onSubmit} className="p-4 sm:p-6 lg:p-8">
                          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[oklch(0.66_0.14_358.91)]" />
                            <h2 className="text-lg sm:text-xl font-medium text-gray-900">
                              Preferences
                            </h2>
                          </div>

                  <div className="space-y-6">
                            {/* Notifications */}
                            <div>
                              <h3 className="text-sm sm:text-base font-normal text-gray-900 mb-3 sm:mb-4">
                                Notification Preferences
                              </h3>
                      <div className="space-y-3">
                        {[
                          {
                            name: 'emailNotifications' as const,
                            label: 'Email Notifications',
                            description: 'Receive general email notifications',
                          },
                          {
                            name: 'smsNotifications' as const,
                            label: 'SMS Notifications',
                            description: 'Receive SMS updates on your phone',
                          },
                          {
                            name: 'orderUpdates' as const,
                            label: 'Order Updates',
                            description:
                              'Get notified about order status changes',
                          },
                          {
                            name: 'promotionalEmails' as const,
                            label: 'Promotional Emails',
                            description: 'Receive promotional offers and deals',
                          },
                          {
                            name: 'newsletterOptIn' as const,
                            label: 'Newsletter',
                            description: 'Subscribe to our newsletter',
                          },
                        ].map(item => (
                          <Controller
                            key={item.name}
                            name={item.name}
                            control={form.control}
                            render={({ field }) => (
                              <div className="flex items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                                <div>
                                  <h4 className="text-sm font-normal text-gray-900">
                                    {item.label}
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    {item.description}
                                  </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.value || false}
                                    onChange={e => field.onChange(e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[oklch(0.66_0.14_358.91)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[oklch(0.66_0.14_358.91)] peer-checked:to-[oklch(0.58_0.16_8)]"></div>
                                </label>
                              </div>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                            {/* Language & Region */}
                            <div>
                              <h3 className="text-sm sm:text-base font-normal text-gray-900 mb-3 sm:mb-4">
                                Language & Region
                              </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                          name="language"
                          control={form.control}
                          render={({ field }) => (
                            <CustomDropdown
                              label="Language"
                              value={field.value || 'en'}
                              onChange={field.onChange}
                              options={languageOptions}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

                      {/* Privacy & Security Tab */}
                      {activeTab === 'privacy' && (
                        <div className="p-4 sm:p-6 lg:p-8">
                          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[oklch(0.66_0.14_358.91)]" />
                            <h2 className="text-lg sm:text-xl font-medium text-gray-900">
                              Privacy & Security
                            </h2>
                          </div>

                  <div className="space-y-6">
                            {/* Security */}
                            <div>
                              <h3 className="text-sm sm:text-base font-normal text-gray-900 mb-3 sm:mb-4">
                                Security
                              </h3>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h4 className="text-sm font-normal text-gray-900">
                              Two-Factor Authentication
                            </h4>
                            <p className="text-xs text-gray-600">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Controller
                            name="twoFactorEnabled"
                            control={form.control}
                            render={({ field }) => (
                              <button
                                type="button"
                                onClick={() => field.onChange(!field.value)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white text-xs font-normal rounded-lg hover:shadow-md transition-all"
                              >
                                {field.value ? 'Disable' : 'Enable'}
                              </button>
                            )}
                          />
                        </div>

                        <div className="flex items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h4 className="text-sm font-normal text-gray-900">
                              Change Password
                            </h4>
                            <p className="text-xs text-gray-600">
                              Update your password regularly for better security
                            </p>
                          </div>
                          <button className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 text-xs font-normal rounded-lg hover:bg-gray-50 transition-colors">
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
                        <div className="p-4 sm:p-6 lg:p-8">
                          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[oklch(0.66_0.14_358.91)]" />
                            <h2 className="text-lg sm:text-xl font-medium text-gray-900">
                              Activity Overview
                            </h2>
                          </div>
                          <div className="space-y-4 sm:space-y-6">
                            <div>
                              <h3 className="text-sm sm:text-base font-normal text-gray-900 mb-2 sm:mb-3">
                                Recent Orders
                              </h3>
                      <div className="space-y-3">
                        {ordersPreview.slice(0, 5).map(o => (
                          <div
                            key={o._id}
                            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl"
                          >
                            <div>
                              <p className="text-sm font-normal text-gray-900">
                                {o.orderNumber}
                              </p>
                              <p className="text-xs text-gray-500">
                                {o.createdAt
                                  ? new Date(o.createdAt).toLocaleDateString()
                                  : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-normal text-gray-900">
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

              {/* Stats Tab - Mobile Only */}
              {activeTab === 'stats' && (
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[oklch(0.66_0.14_358.91)]" />
                    <h2 className="text-lg sm:text-xl font-medium text-gray-900">
                      Quick Stats
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                          <span className="text-xs sm:text-sm font-normal text-gray-900">Orders</span>
                        </div>
                        <span className="text-sm sm:text-base font-normal text-gray-900">{ordersPreview.length}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                          <span className="text-xs sm:text-sm font-normal text-gray-900">Favorites</span>
                        </div>
                        <span className="text-sm sm:text-base font-normal text-gray-900">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                      {/* Action Buttons */}
                      {isDirty &&
                        (activeTab === 'profile' || activeTab === 'preferences') && (
                          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
                            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const formId =
                                    activeTab === 'profile'
                                      ? 'profile-form'
                                      : 'preferences-form';
                                  const formElement = document.getElementById(formId);
                                  if (formElement) {
                                    (formElement as HTMLFormElement).requestSubmit();
                                  }
                                }}
                                disabled={!isValid || isSubmitting}
                                className={`px-4 sm:px-6 py-2 sm:py-3 text-white text-xs sm:text-sm font-medium rounded-xl transition-all ${
                                  !isValid || isSubmitting
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:shadow-[oklch(0.66_0.14_358.91)]/25'
                                }`}
                              >
                                {isSubmitting ? (
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs sm:text-sm">Saving...</span>
                                  </div>
                                ) : (
                                  <span className="text-xs sm:text-sm">Save Changes</span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>

                              {form.formState.errors.root && (
                                <div className="flex items-center gap-1.5 sm:gap-2 text-red-600">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full"></div>
                                  <p className="text-xs sm:text-sm">
                                    {form.formState.errors.root.message}
                                  </p>
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
