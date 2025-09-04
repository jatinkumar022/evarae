'use client';
import { useState } from 'react';
import { Save, Bell, Shield, CreditCard, Truck, Globe } from 'lucide-react';

interface Settings {
  general: {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    currency: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    inventoryAlerts: boolean;
    customerNotifications: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAttempts: number;
  };
  shipping: {
    freeShippingThreshold: number;
    defaultShippingCost: number;
    shippingZones: Array<{
      name: string;
      cost: number;
      countries: string[];
    }>;
  };
  payment: {
    acceptCreditCards: boolean;
    acceptUPI: boolean;
    acceptNetBanking: boolean;
    acceptWallets: boolean;
    paymentGateway: string;
  };
}

const mockSettings: Settings = {
  general: {
    storeName: 'Caelvi Jewellery',
    storeEmail: 'admin@caelvi.com',
    storePhone: '+91 98765 43210',
    storeAddress: '123 Jewellery Street, Mumbai, Maharashtra 400001',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'English',
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    inventoryAlerts: true,
    customerNotifications: true,
    marketingEmails: false,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
  },
  shipping: {
    freeShippingThreshold: 100000,
    defaultShippingCost: 500,
    shippingZones: [
      {
        name: 'Local (Same City)',
        cost: 200,
        countries: ['India'],
      },
      {
        name: 'Domestic (Same State)',
        cost: 400,
        countries: ['India'],
      },
      {
        name: 'Domestic (Other States)',
        cost: 600,
        countries: ['India'],
      },
    ],
  },
  payment: {
    acceptCreditCards: true,
    acceptUPI: true,
    acceptNetBanking: true,
    acceptWallets: true,
    paymentGateway: 'Razorpay',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(mockSettings);
  const [activeTab, setActiveTab] = useState('general');

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    section: keyof Settings,
    field: string,
    value: unknown
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'payment', name: 'Payment', icon: CreditCard },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                General Settings
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.storeName}
                    onChange={e =>
                      handleInputChange('general', 'storeName', e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Store Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.storeEmail}
                    onChange={e =>
                      handleInputChange('general', 'storeEmail', e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Store Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.general.storePhone}
                    onChange={e =>
                      handleInputChange('general', 'storePhone', e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    value={settings.general.currency}
                    onChange={e =>
                      handleInputChange('general', 'currency', e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Store Address
                  </label>
                  <textarea
                    rows={3}
                    value={settings.general.storeAddress}
                    onChange={e =>
                      handleInputChange(
                        'general',
                        'storeAddress',
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Notification Settings
              </h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-sm text-gray-500">
                        Receive notifications for{' '}
                        {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleInputChange('notifications', key, !value)
                      }
                      className={`${
                        value ? 'bg-primary' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          value ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Security Settings
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Two-Factor Authentication
                    </label>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleInputChange(
                        'security',
                        'twoFactorAuth',
                        !settings.security.twoFactorAuth
                      )
                    }
                    className={`${
                      settings.security.twoFactorAuth
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.security.twoFactorAuth
                          ? 'translate-x-5'
                          : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={e =>
                        handleInputChange(
                          'security',
                          'sessionTimeout',
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={e =>
                        handleInputChange(
                          'security',
                          'passwordExpiry',
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={e =>
                        handleInputChange(
                          'security',
                          'loginAttempts',
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Shipping Settings
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Free Shipping Threshold
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.freeShippingThreshold}
                    onChange={e =>
                      handleInputChange(
                        'shipping',
                        'freeShippingThreshold',
                        parseInt(e.target.value)
                      )
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Orders above{' '}
                    {formatCurrency(settings.shipping.freeShippingThreshold)}{' '}
                    get free shipping
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Default Shipping Cost
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.defaultShippingCost}
                    onChange={e =>
                      handleInputChange(
                        'shipping',
                        'defaultShippingCost',
                        parseInt(e.target.value)
                      )
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Shipping Zones
                </h4>
                <div className="space-y-4">
                  {settings.shipping.shippingZones.map((zone, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Zone Name
                          </label>
                          <input
                            type="text"
                            value={zone.name}
                            onChange={e => {
                              const newZones = [
                                ...settings.shipping.shippingZones,
                              ];
                              newZones[index].name = e.target.value;
                              handleInputChange(
                                'shipping',
                                'shippingZones',
                                newZones
                              );
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Shipping Cost
                          </label>
                          <input
                            type="number"
                            value={zone.cost}
                            onChange={e => {
                              const newZones = [
                                ...settings.shipping.shippingZones,
                              ];
                              newZones[index].cost = parseInt(e.target.value);
                              handleInputChange(
                                'shipping',
                                'shippingZones',
                                newZones
                              );
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Countries
                          </label>
                          <input
                            type="text"
                            value={zone.countries.join(', ')}
                            onChange={e => {
                              const newZones = [
                                ...settings.shipping.shippingZones,
                              ];
                              newZones[index].countries = e.target.value
                                .split(',')
                                .map(c => c.trim());
                              handleInputChange(
                                'shipping',
                                'shippingZones',
                                newZones
                              );
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Payment Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Gateway
                  </label>
                  <select
                    value={settings.payment.paymentGateway}
                    onChange={e =>
                      handleInputChange(
                        'payment',
                        'paymentGateway',
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="Razorpay">Razorpay</option>
                    <option value="PayU">PayU</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">
                    Payment Methods
                  </h4>
                  {Object.entries(settings.payment)
                    .filter(([key]) => key.startsWith('accept'))
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            {key
                              .replace('accept', '')
                              .replace(/([A-Z])/g, ' $1')
                              .trim()}
                          </label>
                          <p className="text-sm text-gray-500">
                            Accept{' '}
                            {key
                              .replace('accept', '')
                              .toLowerCase()
                              .replace(/([A-Z])/g, ' $1')}{' '}
                            payments
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleInputChange('payment', key, !value)
                          }
                          className={`${
                            value ? 'bg-primary' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                        >
                          <span
                            className={`${
                              value ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
