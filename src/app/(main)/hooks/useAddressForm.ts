import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toastApi from '@/lib/toast';

// Zod schema for address form validation - matches userProfile schema
// Note: line2 is optional in the schema but always present in the form (defaults to empty string)
export const addressFormSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name cannot exceed 50 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be exactly 10 digits')
    .max(10, 'Phone number must be exactly 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Phone number must start with 6, 7, 8, or 9'),
  line1: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(100, 'Address cannot exceed 100 characters'),
  line2: z.string().max(100, 'Address line 2 cannot exceed 100 characters'),
  city: z
    .string()
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name cannot exceed 50 characters'),
  state: z
    .string()
    .min(2, 'State name must be at least 2 characters')
    .max(50, 'State name cannot exceed 50 characters'),
  postalCode: z
    .string()
    .length(6, 'Postal code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Postal code must contain only digits'),
  country: z.string().min(2, 'Country is required'),
  isDefaultShipping: z.boolean(),
  isDefaultBilling: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

export type Address = {
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
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

interface UseAddressFormOptions {
  initialData?: Partial<AddressFormData>;
  editingId?: string | null;
  onSuccess?: (addresses: Address[]) => void;
}

export function useAddressForm({
  initialData,
  editingId,
  onSuccess,
}: UseAddressFormOptions = {}) {
  const defaultValues: AddressFormData = {
    label: 'Home',
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
    ...initialData,
  };

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Reset form when initialData or editingId changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      form.reset({
        label: initialData.label || 'Home',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        line1: initialData.line1 || '',
        line2: initialData.line2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || '',
        country: initialData.country || 'IN',
        isDefaultShipping: initialData.isDefaultShipping || false,
        isDefaultBilling: initialData.isDefaultBilling || false,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [initialData, editingId, form, defaultValues]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      // Normalize phone and postal code (remove non-digits) - match schema exactly
      const normalizedData: AddressFormData = {
        label: data.label || 'Home',
        fullName: data.fullName.trim(),
        phone: data.phone.replace(/\D/g, '').slice(0, 10),
        line1: data.line1.trim(),
        line2: (data.line2 || '').trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.replace(/\D/g, '').slice(0, 6),
        country: data.country || 'IN',
        isDefaultShipping: data.isDefaultShipping || false,
        isDefaultBilling: data.isDefaultBilling || false,
      };

      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : '/api/account/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(normalizedData),
      });

      if (!res.ok) {
        let errorMessage = `Failed to save address (${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage = errorData?.error || errorData?.message || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const responseData = await res.json();
      const addresses = responseData.addresses || [];

      toastApi.success('Address saved', 'Your address has been saved successfully');
      form.reset();
      onSuccess?.(addresses);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save address';
      console.error('Address save error:', error);
      toastApi.error('Save failed', message);
      throw error;
    }
  };

  const handleCancel = () => {
    form.reset();
  };

  const isSubmitting = form.formState.isSubmitting;
  const isValid = form.formState.isValid;

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleCancel,
    isSubmitting,
    isValid,
  };
}

