import { useCallback, useEffect, useState } from 'react';
import type { Address } from './useAddressForm';

export function useAddressData() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/account/addresses', {
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load addresses';
      setError(message);
      console.error('Failed to fetch addresses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

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

      await fetchAddresses();
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

      const data = await res.json();
      setAddresses(data.addresses || []);
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
    isLoading,
    error,
    refetch: fetchAddresses,
    deleteAddress,
    setDefaultShipping,
  };
}

