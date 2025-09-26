'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, Plus, Edit3, Trash2, Star } from 'lucide-react';
import toastApi from '@/lib/toast';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Address>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/account/addresses', { cache: 'no-store' });
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch {
      setError('Failed to load addresses');
      toastApi.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyAddress);
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
    setShowModal(true);
  };

  const submit = async () => {
    try {
      setSaving(true);
      setError(null);
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent mb-2">
            Shipping Addresses
          </h1>
          <p className="text-gray-600">
            Manage your delivery addresses for faster checkout
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-700">Total: {stats.total}</div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" /> Add New Address
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Addresses Found
            </h3>
            <button
              onClick={openAdd}
              className="px-6 py-3 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white font-medium rounded-xl hover:shadow-lg transition-all"
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
                    ? 'border-[oklch(0.66_0.14_358.91)] ring-2 ring-[oklch(0.66_0.14_358.91)]/20'
                    : 'border-[oklch(0.84_0.04_10.35)]/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        a.isDefaultShipping
                          ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {a.label}
                        </h3>
                        {a.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/10 to-[oklch(0.58_0.16_8)]/10 text-[oklch(0.66_0.14_358.91)] text-xs font-medium rounded-full">
                            <Star className="w-3 h-3" /> Default Shipping
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {a.fullName} • {a.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-3">
                  <p>{a.line1}</p>
                  {a.line2 && <p>{a.line2}</p>}
                  <p>
                    {a.city}, {a.state} {a.postalCode}
                  </p>
                  <p>{a.country}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  {!a.isDefaultShipping && (
                    <button
                      onClick={() =>
                        openEdit({ ...a, isDefaultShipping: true })
                      }
                      className="px-3 py-2 text-xs font-medium text-[oklch(0.66_0.14_358.91)] hover:bg-gradient-to-r hover:from-[oklch(0.66_0.14_358.91)]/10 hover:to-[oklch(0.58_0.16_8)]/10 rounded-lg transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(a)}
                    className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div className="p-4 border-b font-semibold">
                {editingId ? 'Edit Address' : 'Add Address'}
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Label"
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={e =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 15),
                    })
                  }
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Address line 1"
                  value={form.line1}
                  onChange={e => setForm({ ...form, line1: e.target.value })}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Address line 2"
                  value={form.line2}
                  onChange={e => setForm({ ...form, line2: e.target.value })}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="City"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="State"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Postal Code"
                  value={form.postalCode}
                  onChange={e =>
                    setForm({ ...form, postalCode: e.target.value })
                  }
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Country"
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                />
                <label className="text-xs text-gray-700 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isDefaultShipping}
                    onChange={e =>
                      setForm({ ...form, isDefaultShipping: e.target.checked })
                    }
                  />{' '}
                  Default shipping
                </label>
                <label className="text-xs text-gray-700 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isDefaultBilling}
                    onChange={e =>
                      setForm({ ...form, isDefaultBilling: e.target.checked })
                    }
                  />{' '}
                  Default billing
                </label>
              </div>
              <div className="p-4 border-t flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)]"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
