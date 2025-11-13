'use client';

import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Star,
  X,
  Phone,
} from 'lucide-react';
import { Controller } from 'react-hook-form';
import toastApi from '@/lib/toast';
import { useAddressForm, type Address } from '@/app/(main)/hooks/useAddressForm';
import { useAddressData } from '@/app/(main)/hooks/useAddressData';

function AddressesPageInner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addresses,  deleteAddress, setDefaultShipping, refetch } =
    useAddressData();

  const [initialData, setInitialData] = useState<Partial<Address>>({});

  const { form, onSubmit, isSubmitting, isValid } =
    useAddressForm({
      initialData,
      editingId,
      onSuccess: () => {
        setIsModalOpen(false);
        setEditingId(null);
        setInitialData({});
        refetch();
      },
    });

  // Reset modal state when closed
  useEffect(() => {
    if (!isModalOpen) {
      setEditingId(null);
      setInitialData({});
      form.reset();
    }
  }, [form, isModalOpen]);

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isModalOpen || isDeleteModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (isDeleteModalOpen) {
            setIsDeleteModalOpen(false);
          } else {
            setIsModalOpen(false);
          }
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isModalOpen, isDeleteModalOpen]);

  const openAddModal = () => {
    setEditingId(null);
    setInitialData({});
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingId(address._id || null);
    setInitialData({
      label: address.label || 'Home',
      fullName: address.fullName || '',
      phone: address.phone || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'IN',
      isDefaultShipping: address.isDefaultShipping || false,
      isDefaultBilling: address.isDefaultBilling || false,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete?._id) return;

    try {
      setIsDeleting(true);
      await deleteAddress(addressToDelete._id);
      toastApi.success('Address deleted', 'Address has been removed successfully');
      setIsDeleteModalOpen(false);
      setAddressToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete address';
      toastApi.error('Delete failed', message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id?: string) => {
    if (!id) return;
    try {
      await setDefaultShipping(id);
      toastApi.success('Default address updated', 'Shipping address has been set as default');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to set default address';
      toastApi.error('Update failed', message);
    }
  };


  return (
    <main className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent font-medium font-heading mb-2">
                My Addresses
              </h1>
              <p className="text-sm text-gray-600">
                Manage your delivery addresses for faster checkout
              </p>
            </div>
            {addresses.length > 0 && (
              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[oklch(0.66_0.14_358.91)]/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            )}
          </div>
          {addresses.length > 0 && (
            <div className="text-xs text-gray-600 border-b border-[oklch(0.84_0.04_10.35)]/30 pb-3">
              {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
            </div>
          )}
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[oklch(0.84_0.04_10.35)]/30 shadow-sm p-12 sm:p-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/10 to-[oklch(0.58_0.16_8)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-[oklch(0.66_0.14_358.91)]" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No addresses yet
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              Add your first delivery address to get started with faster checkout
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-2.5 border-primary border text-primary text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[oklch(0.66_0.14_358.91)]/25 transition-all"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col ${
                  address.isDefaultShipping
                    ? 'border-[oklch(0.66_0.14_358.91)] ring-2 ring-[oklch(0.66_0.14_358.91)]/20 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/5 to-[oklch(0.58_0.16_8)]/5'
                    : 'border-[oklch(0.84_0.04_10.35)]/30 hover:border-[oklch(0.84_0.04_10.35)]/50'
                }`}
              >
                <div className="p-5 flex flex-col h-full min-h-[280px]">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          address.isDefaultShipping
                            ? 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {address.fullName}
                          </h3>
                        </div>
                        {address.isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[oklch(0.66_0.14_358.91)]/10 to-[oklch(0.58_0.16_8)]/10 text-[oklch(0.66_0.14_358.91)] text-xs font-medium rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            Default Shipping
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-1.5 mb-4 flex-1">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span className="font-medium">{address.phone}</span>
                    </div>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      <p className="font-medium">{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-gray-500">{address.country}</p>
                    </div>
                  </div>

                  {/* Actions - Always at bottom */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-[oklch(0.84_0.04_10.35)]/30 mt-auto">
                    {!address.isDefaultShipping && (
                      <button
                        onClick={() => handleSetDefault(address._id)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-normal text-[oklch(0.66_0.14_358.91)] rounded-lg transition-colors border border-gray-300/50 bg-[#d5d5d51a] hover:bg-[#80808030] active:scale-[0.98]"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Set Default
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal({ ...address, line2: address.line2 ?? '' })}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-normal text-[oklch(0.66_0.14_358.91)] rounded-lg transition-colors border border-gray-300/50 bg-[#d5d5d51a] hover:bg-[#80808030] active:scale-[0.98]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick({ ...address, line2: address.line2 ?? '' })}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-normal text-[#d92d20] rounded-lg transition-colors border border-gray-300/50 bg-[#d5d5d51a] hover:bg-[#80808030] active:scale-[0.98]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Address Modal */}
        {isModalOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none z-50">
              <div
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col pointer-events-auto border border-[oklch(0.84_0.04_10.35)]/30"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - Fixed */}
                <div className="flex items-center rounded-t-2xl justify-between p-5 border-b border-[oklch(0.84_0.04_10.35)]/30 bg-white flex-shrink-0">
                  <h2 className="text-lg font-medium text-gray-900">
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Form Content - Scrollable */}
                <form
                  id="address-form"
                  onSubmit={onSubmit}
                  className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
                >
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Controller
                      name="fullName"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div>
                          <input
                            {...field}
                            type="text"
                            autoComplete="name"
                            className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors relative z-10 ${
                              fieldState.error ? 'border-red-300' : ''
                            }`}
                            placeholder="Enter full name"
                            maxLength={50}
                            style={{ WebkitAppearance: 'none' }}
                          />
                          {fieldState.error && (
                            <p className="text-xs text-red-600 mt-1.5">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Controller
                      name="phone"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div className="relative">
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none z-50" />
                            <input
                              {...field}
                              type="tel"
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                const normalized =
                                  digits.length > 10 ? digits.slice(-10) : digits;
                                field.onChange(normalized);
                              }}
                              onPaste={(event) => {
                                const pasted = event.clipboardData?.getData('text');
                                if (!pasted) return;
                                event.preventDefault();
                                const digits = pasted.replace(/\D/g, '');
                                const normalized =
                                  digits.length > 10 ? digits.slice(-10) : digits;
                                field.onChange(normalized);
                              }}
                              maxLength={10}
                              className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white pl-10 pr-4 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors relative z-10 ${
                                fieldState.error ? 'border-red-300' : ''
                              }`}
                              placeholder="Enter 10 digit phone number"
                              autoComplete="tel"
                              inputMode="numeric"
                              style={{ WebkitAppearance: 'none' }}
                            />
                          </div>
                          {fieldState.error && (
                            <div className="mt-1.5 min-h-[20px]">
                              <p className="text-xs text-red-600 relative z-20">
                                {fieldState.error.message}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Address Line 1
                    </label>
                    <Controller
                      name="line1"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div>
                          <input
                            {...field}
                            type="text"
                            autoComplete="street-address"
                            className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors relative z-10 ${
                              fieldState.error ? 'border-red-300' : ''
                            }`}
                            placeholder="Street address, P.O. box"
                            maxLength={100}
                            style={{ WebkitAppearance: 'none' }}
                          />
                          {fieldState.error && (
                            <p className="text-xs text-red-600 mt-1.5">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <Controller
                      name="line2"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <div>
                          <input
                            {...field}
                            type="text"
                            autoComplete="address-line2"
                            className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors relative z-10 ${
                              fieldState.error ? 'border-red-300' : ''
                            }`}
                            placeholder="Apartment, suite, unit, building, floor"
                            maxLength={100}
                            style={{ WebkitAppearance: 'none' }}
                          />
                          {fieldState.error && (
                            <p className="text-xs text-red-600 mt-1.5">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <Controller
                        name="city"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div>
                            <input
                              {...field}
                              type="text"
                              autoComplete="address-level2"
                              className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors relative z-10 ${
                                fieldState.error ? 'border-red-300' : ''
                              }`}
                              placeholder="City"
                              maxLength={50}
                              style={{ WebkitAppearance: 'none' }}
                            />
                            {fieldState.error && (
                              <p className="text-xs text-red-600 mt-1.5">
                                {fieldState.error.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <Controller
                        name="state"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div>
                            <input
                              {...field}
                              type="text"
                              autoComplete="address-level1"
                              className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors relative z-10 ${
                                fieldState.error ? 'border-red-300' : ''
                              }`}
                              placeholder="State"
                              maxLength={50}
                              style={{ WebkitAppearance: 'none' }}
                            />
                            {fieldState.error && (
                              <p className="text-xs text-red-600 mt-1.5">
                                {fieldState.error.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Postal Code and Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <Controller
                        name="postalCode"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div>
                            <input
                              {...field}
                              type="text"
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\D/g, '')
                                  .slice(0, 6);
                                field.onChange(value);
                              }}
                              maxLength={6}
                              autoComplete="postal-code"
                              className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm text-left tracking-widest font-mono focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors relative z-10 ${
                                fieldState.error ? 'border-red-300' : ''
                              }`}
                              placeholder="123456"
                              inputMode="numeric"
                              style={{ WebkitAppearance: 'none' }}
                            />
                            {fieldState.error && (
                              <p className="text-xs text-red-600 mt-1.5">
                                {fieldState.error.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <Controller
                        name="country"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <div>
                            <input
                              {...field}
                              type="text"
                              autoComplete="country"
                              className={`w-full rounded-xl border border-[oklch(0.84_0.04_10.35)]/40 bg-white px-4 py-2 sm:py-3 text-sm focus:border-[oklch(0.66_0.14_358.91)] focus:ring-2 focus:ring-[oklch(0.66_0.14_358.91)]/20 focus:outline-none transition-colors relative z-10 ${
                                fieldState.error ? 'border-red-300' : ''
                              }`}
                              placeholder="Country"
                              maxLength={50}
                              style={{ WebkitAppearance: 'none' }}
                            />
                            {fieldState.error && (
                              <p className="text-xs text-red-600 mt-1.5">
                                {fieldState.error.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Default Checkboxes */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Controller
                      name="isDefaultShipping"
                      control={form.control}
                      render={({ field }) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4 rounded border-gray-300 text-[oklch(0.66_0.14_358.91)] focus:ring-[oklch(0.66_0.14_358.91)]/20"
                          />
                          <span className="text-xs sm:text-sm text-gray-700">
                            Set as default shipping address
                          </span>
                        </label>
                      )}
                    />
                    <Controller
                      name="isDefaultBilling"
                      control={form.control}
                      render={({ field }) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4 rounded border-gray-300 text-[oklch(0.66_0.14_358.91)] focus:ring-[oklch(0.66_0.14_358.91)]/20"
                          />
                          <span className="text-xs sm:text-sm text-gray-700">
                            Set as default billing address
                          </span>
                        </label>
                      )}
                    />
                  </div>

                </form>

                {/* Footer Buttons - Fixed at Bottom */}
                <div className="rounded-b-2xl border-t border-[oklch(0.84_0.04_10.35)]/30 bg-gray-50 p-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-normal rounded-md hover:bg-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="address-form"
                    disabled={!isValid || isSubmitting}
                    className={`px-5 py-2.5 text-white text-sm font-normal rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      !isValid || isSubmitting
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-lg hover:shadow-[oklch(0.66_0.14_358.91)]/25'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2 justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : editingId ? (
                      'Update Address'
                    ) : (
                      'Save Address'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40"
              onClick={() => setIsDeleteModalOpen(false)}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none z-50">
              <div
                className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-xl flex flex-col pointer-events-auto border border-[oklch(0.84_0.04_10.35)]/30"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="rounded-t-2xl flex items-center justify-between p-5 border-b border-[oklch(0.84_0.04_10.35)]/30 bg-white flex-shrink-0">
                  <h2 className="text-lg font-medium text-gray-900">
                    Delete Address
                  </h2>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close"
                    disabled={isDeleting}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <Trash2 className="h-6 w-6 text-[#d92d20]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Are you sure you want to delete the address for{' '}
                        <span className="font-medium text-gray-900">
                          {addressToDelete?.fullName}
                        </span>
                        ? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons - Fixed at Bottom */}
                <div className="rounded-b-2xl border-t border-[oklch(0.84_0.04_10.35)]/30 bg-gray-50 p-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-normal rounded-md hover:bg-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="px-5 py-2.5 bg-[#d92d20] text-white text-sm font-normal rounded-md hover:bg-[#c0231a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2 justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </span>
                    ) : (
                      'Delete Address'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function AddressesPage() {
  return <AddressesPageInner />;
}
