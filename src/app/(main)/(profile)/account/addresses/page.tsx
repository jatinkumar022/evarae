'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, Plus, Edit3, Trash2, Star } from 'lucide-react';
import toastApi from '@/lib/toast';
import Container from '@/app/(main)/components/layouts/Container';

type Address = {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

const emptyAddress: Address = {
  label: '',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'IN',
  isDefaultShipping: false,
  isDefaultBilling: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Address>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const load = async () => {
    setError(null);
    try {
      const res = await fetch('/api/account/addresses', { cache: 'no-store' });
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch {
      setError('Failed to load addresses');
      toastApi.error('Failed to load addresses');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr._id || null);
    setForm({
      label: addr.label || '',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'IN',
      isDefaultShipping: !!addr.isDefaultShipping,
      isDefaultBilling: !!addr.isDefaultBilling,
      _id: addr._id,
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const validateClient = (a: Address) => {
    const errs: Record<string, string> = {};
    
    // Full Name validation
    if (!a.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (a.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters';
    } else if (a.fullName.trim().length > 50) {
      errs.fullName = 'Full name cannot exceed 50 characters';
    }
    
    // Phone validation - exactly 10 digits
    const phone = a.phone.replace(/\D/g, '');
    if (!phone) {
      errs.phone = 'Phone number is required';
    } else if (phone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits';
    } else if (!/^[6-9]/.test(phone)) {
      errs.phone = 'Phone number must start with 6, 7, 8, or 9';
    }
    
    // Address Line 1 validation
    if (!a.line1.trim()) {
      errs.line1 = 'Address line 1 is required';
    } else if (a.line1.trim().length < 5) {
      errs.line1 = 'Address must be at least 5 characters';
    } else if (a.line1.trim().length > 100) {
      errs.line1 = 'Address cannot exceed 100 characters';
    }
    
    // Address Line 2 validation (optional but if provided, should be valid)
    if (a.line2 && a.line2.trim().length > 100) {
      errs.line2 = 'Address line 2 cannot exceed 100 characters';
    }
    
    // City validation
    if (!a.city.trim()) {
      errs.city = 'City is required';
    } else if (a.city.trim().length < 2) {
      errs.city = 'City name must be at least 2 characters';
    } else if (a.city.trim().length > 50) {
      errs.city = 'City name cannot exceed 50 characters';
    }
    
    // State validation
    if (!a.state.trim()) {
      errs.state = 'State is required';
    } else if (a.state.trim().length < 2) {
      errs.state = 'State name must be at least 2 characters';
    } else if (a.state.trim().length > 50) {
      errs.state = 'State name cannot exceed 50 characters';
    }
    
    // Postal Code validation - exactly 6 digits
    const postalCode = a.postalCode.replace(/\D/g, '');
    if (!postalCode) {
      errs.postalCode = 'Postal code is required';
    } else if (postalCode.length !== 6) {
      errs.postalCode = 'Postal code must be exactly 6 digits';
    }
    
    // Country validation
    if (!a.country.trim()) {
      errs.country = 'Country is required';
    } else if (a.country.trim().length < 2) {
      errs.country = 'Country name must be at least 2 characters';
    }
    
    return errs;
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);
      const errs = validateClient(form);
      setFieldErrors(errs);
      if (Object.keys(errs).length > 0) {
        const first = Object.values(errs)[0];
        toastApi.error('Invalid address', first);
        setSaving(false);
        return;
      }
      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : '/api/account/addresses';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save address');
      setAddresses(data.addresses || []);
      setShowModal(false);
      toastApi.success('Address saved');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to save address';
      setError(message);
      toastApi.error('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    if (!confirm('Remove this address?')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => ({ total: addresses.length }), [addresses]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-heading mb-2">
            Shipping Addresses
          </h1>
          <p className="text-primary-dark">
            Manage your delivery addresses for faster checkout
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-primary-dark">Total: {stats.total}</div>
          <button
            onClick={openAdd}
            className="btn btn-filled flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add New Address
          </button>
        </div>

        {/* Global loader will handle loading state */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-primary/20 shadow-sm p-12 text-center">
            <MapPin className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-heading mb-2">
              No Addresses Found
            </h3>
            <button
              onClick={openAdd}
              className="btn btn-filled"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {addresses.map(a => (
              <div
                key={a._id}
                className={`bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-all ${
                  a.isDefaultShipping
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        a.isDefaultShipping
                          ? 'bg-primary text-white'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-heading">
                          {a.fullName}
                        </h3>
                        {a.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            <Star className="w-3 h-3" /> Default Shipping
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-primary-dark">{a.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-primary-dark mb-3">
                  <p>{a.line1}</p>
                  {a.line2 && <p>{a.line2}</p>}
                  <p>
                    {a.city}, {a.state} {a.postalCode}
                  </p>
                  <p>{a.country}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-primary/10">
                  {!a.isDefaultShipping && (
                    <button
                      onClick={() =>
                        openEdit({ ...a, isDefaultShipping: true })
                      }
                      className="btn btn-ghost text-xs px-3 py-2"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(a)}
                    className="px-3 py-2 text-xs font-medium text-primary hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3 h-3 inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => remove(a._id)}
                    className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden">
              <div className="p-4 border-b border-primary/10 font-heading font-semibold text-heading">
                {editingId ? 'Edit Address' : 'Add Address'}
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Label removed as it's not important */}
                <div>
                  <input
                    type="text"
                    className="border border-primary/20 rounded-lg px-3 py-2 text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={e =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    maxLength={50}
                  />
                  {fieldErrors.fullName && (
                    <div className="text-xs text-red-600 mt-1">
                      {fieldErrors.fullName}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    className="border border-primary/20 rounded-lg px-3 py-2 text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder="Phone Number (10 digits)"
                    value={form.phone}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm({ ...form, phone: value });
                    }}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                  />
                  {fieldErrors.phone && (
                    <div className="text-xs text-red-600 mt-1">
                      {fieldErrors.phone}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    className="border border-primary/20 rounded-lg px-3 py-2 text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder="Address line 1"
                    value={form.line1}
                    onChange={e => setForm({ ...form, line1: e.target.value })}
                    maxLength={100}
                  />
                  {fieldErrors.line1 && (
                    <div className="text-xs text-red-600 mt-1">
                      {fieldErrors.line1}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <input
                    className="border border-primary/20 rounded-lg px-3 py-2 text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder="Address line 2 (Optional)"
                    value={form.line2}
                    onChange={e => setForm({ ...form, line2: e.target.value })}
                    maxLength={100}
                  />
                  {fieldErrors.line2 && (
                    <div className="text-xs text-red-600 mt-1">
                      {fieldErrors.line2}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    className="border border-primary/20 rounded-lg px-3 py-2 text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder="City"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    maxLength={50}
                  />
                  {fieldErrors.city && (
                    <div className="text-xs text-red-600 mt-1">
                      {fieldErrors.city}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    className="border border-primary/20 rounded-lg px-3 py-2 text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder="State"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    maxLength={50}
                  />
                  {fieldErrors.state && (
                    <div className="text-xs text-red-600 mt-1">
                      {fieldErrors.state}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    className="border border-primary/20 rounded-lg px-3 py-2 text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors text-center tracking-widest font-mono"
                    placeholder="123456"
                    value={form.postalCode}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setForm({ ...form, postalCode: value });
                    }}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    style={{ letterSpacing: '0.2em' }}
                  />
                  {fieldErrors.postalCode && (
                    <div className="text-xs text-red-600 mt-1">
                      {fieldErrors.postalCode}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    className="border border-primary/20 rounded-lg px-3 py-2 text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    placeholder="Country"
                    value={form.country}
                    onChange={e =>
                      setForm({ ...form, country: e.target.value })
                    }
                    maxLength={50}
                  />
                  {fieldErrors.country && (
                    <div className="text-xs text-red-600 mt-1">
                      {fieldErrors.country}
                    </div>
                  )}
                </div>
                <label className="text-xs text-primary-dark flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isDefaultShipping}
                    onChange={e =>
                      setForm({ ...form, isDefaultShipping: e.target.checked })
                    }
                    className="rounded border-primary/20 text-primary focus:ring-primary/20"
                  />{' '}
                  Default shipping
                </label>
                <label className="text-xs text-primary-dark flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isDefaultBilling}
                    onChange={e =>
                      setForm({ ...form, isDefaultBilling: e.target.checked })
                    }
                    className="rounded border-primary/20 text-primary focus:ring-primary/20"
                  />{' '}
                  Default billing
                </label>
              </div>
              <div className="p-4 border-t border-primary/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={saving}
                  className="btn btn-filled px-4 py-2 border-2 border-primary"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
