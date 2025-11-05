'use client';
import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  User,
  Globe,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  FileText,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react';
import { CustomSelect } from '@/app/admin/components/CustomSelect';
import { useAdminAuth } from '@/lib/data/store/adminAuth';

interface FooterSettings {
  tagline: string;
  phone: string;
  email: string;
  location: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    facebook: string;
    youtube: string;
  };
}

interface AdminAccount {
  name: string;
  email: string;
}

interface GeneralSettings {
  storeName: string;
  currency: string;
  timezone: string;
}

interface SettingsState {
  footer: FooterSettings;
  adminAccount: AdminAccount;
  general: GeneralSettings;
}

const defaultSettings: SettingsState = {
  footer: {
    tagline: 'Exquisite Jewellery for Every Occasion. Crafted with passion, designed for elegance.',
    phone: '+91 9328901475',
    email: 'support@caelvi.com',
    location: 'Ahmedabad',
    socialLinks: {
      instagram: '#',
      twitter: '#',
      facebook: '#',
      youtube: '#',
    },
  },
  adminAccount: {
    name: 'Admin User',
    email: 'admin@caelvi.com',
  },
  general: {
    storeName: 'Caelvi',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  },
};

export default function SettingsPage() {
  const { profile } = useAdminAuth();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SettingsState>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'footer' | 'admin' | 'general'>('general');

  // Load admin profile when available
  useEffect(() => {
    if (profile) {
      setSettings(prev => ({
        ...prev,
        adminAccount: {
          ...prev.adminAccount,
          name: profile.name,
          email: profile.email,
        },
      }));
      setOriginalSettings(prev => ({
        ...prev,
        adminAccount: {
          ...prev.adminAccount,
          name: profile.name,
          email: profile.email,
        },
      }));
    }
  }, [profile]);

  // Check if form is dirty
  const isDirty = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const handleFooterChange = (field: keyof FooterSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value,
      },
    }));
  };

  const handleSocialLinkChange = (platform: keyof FooterSettings['socialLinks'], value: string) => {
    setSettings(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: {
          ...prev.footer.socialLinks,
          [platform]: value,
        },
      },
    }));
  };


  const handleAdminChange = (field: keyof AdminAccount, value: string) => {
    setSettings(prev => ({
      ...prev,
      adminAccount: {
        ...prev.adminAccount,
        [field]: value,
      },
    }));
  };

  const handleGeneralChange = (field: keyof GeneralSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOriginalSettings({ ...settings });
      // Show success notification
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex md:items-center gap-4 flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-[#bdbdbd] mt-1">
            Manage store settings and your admin account
          </p>
        </div>
        {isDirty && (
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Unsaved changes
            </span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Section Tabs */}
      <div className="bg-white dark:bg-[#191919] shadow rounded-lg border border-gray-200 dark:border-[#525252] overflow-hidden">
        <div className="border-b border-gray-200 dark:border-[#525252]">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveSection('general')}
              className={`px-4 sm:px-6 py-3 sm:py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeSection === 'general'
                  ? 'border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-gray-500 dark:text-[#bdbdbd] hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-[#525252]'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>General</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('admin')}
              className={`px-4 sm:px-6 py-3 sm:py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeSection === 'admin'
                  ? 'border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-gray-500 dark:text-[#bdbdbd] hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-[#525252]'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Admin Account</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('footer')}
              className={`px-4 sm:px-6 py-3 sm:py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeSection === 'footer'
                  ? 'border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-gray-500 dark:text-[#bdbdbd] hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-[#525252]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Footer Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Footer Settings */}
        {activeSection === 'footer' && (
          <div className="p-4 sm:p-5 md:p-6 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="tel"
                      value={settings.footer.phone}
                      onChange={e => handleFooterChange('phone', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="email"
                      value={settings.footer.email}
                      onChange={e => handleFooterChange('email', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="text"
                      value={settings.footer.location}
                      onChange={e => handleFooterChange('location', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Footer Tagline
              </label>
              <textarea
                rows={3}
                value={settings.footer.tagline}
                onChange={e => handleFooterChange('tagline', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                placeholder="Enter tagline..."
              />
            </div>

            {/* Social Media Links */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Social Media Links
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram URL
                    </div>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="url"
                      value={settings.footer.socialLinks.instagram}
                      onChange={e => handleSocialLinkChange('instagram', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter/X URL
                    </div>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="url"
                      value={settings.footer.socialLinks.twitter}
                      onChange={e => handleSocialLinkChange('twitter', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      Facebook URL
                    </div>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="url"
                      value={settings.footer.socialLinks.facebook}
                      onChange={e => handleSocialLinkChange('facebook', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4" />
                      YouTube URL
                    </div>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="url"
                      value={settings.footer.socialLinks.youtube}
                      onChange={e => handleSocialLinkChange('youtube', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Admin Account */}
        {activeSection === 'admin' && (
          <div className="p-4 sm:p-5 md:p-6 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="text"
                      value={settings.adminAccount.name}
                      onChange={e => handleAdminChange('name', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#bdbdbd]" />
                    <input
                      type="email"
                      value={settings.adminAccount.email}
                      onChange={e => handleAdminChange('email', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#bdbdbd]">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="p-4 sm:p-5 md:p-6 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Store Settings
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.storeName}
                    onChange={e => handleGeneralChange('storeName', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-[#525252] rounded-md shadow-sm bg-white dark:bg-[#242424] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#bdbdbd] focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600 sm:text-sm"
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Currency"
                    value={settings.general.currency}
                    onChange={(v) => handleGeneralChange('currency', v)}
                    options={[
                      { value: 'INR', label: 'Indian Rupee (₹)' },
                      { value: 'USD', label: 'US Dollar ($)' },
                      { value: 'EUR', label: 'Euro (€)' },
                      { value: 'GBP', label: 'British Pound (£)' },
                    ]}
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Timezone"
                    value={settings.general.timezone}
                    onChange={(v) => handleGeneralChange('timezone', v)}
                    options={[
                      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                      { value: 'Europe/London', label: 'Europe/London (GMT)' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Save Button - Mobile Only */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 p-4 bg-white dark:bg-[#191919] border-t border-gray-200 dark:border-[#525252] shadow-lg">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Add bottom padding for mobile when save button is visible */}
      {isDirty && <div className="md:hidden h-24" />}
    </div>
  );
}
