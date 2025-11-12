import { useCallback, useEffect, useState } from 'react';
import type { Address } from './useAddressForm';
import { useAddressesStore } from '@/lib/data/mainStore/addressesStore';

export function useAddressData() {
  const { addresses, status, error: storeError, fetchAddresses, refreshAddresses } = useAddressesStore();
  const [error, setError] = useState<string | null>(null);

  // Load addresses once on mount
  useEffect(() => {
    fetchAddresses();
    // Zustand actions are stable, but we only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync error state
  useEffect(() => {
    setError(storeError);
  }, [storeError]);

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || 'Failed to delete address');
      }

      await refreshAddresses();
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete address';
      console.error('Delete address error:', err);
      throw new Error(message);
    }
  };

  const setDefaultShipping = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || 'Failed to set default address');
      }

      await refreshAddresses();
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to set default address';
      console.error('Set default address error:', err);
      throw new Error(message);
    }
  };

  return {
    addresses,
    isLoading: status === 'loading',
    error,
    refetch: refreshAddresses,
    deleteAddress,
    setDefaultShipping,
  };
}

