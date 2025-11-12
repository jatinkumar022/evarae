import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toastApi from '@/lib/toast';

// Zod schema for profile form validation - only fields that exist in UserProfile schema
export const profileFormSchema = z.object({
  // User fields (name is in User model, not UserProfile)
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  
  // Profile fields (from UserProfile schema)
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true; // Allow empty (optional field)
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length === 10;
      },
      { message: 'Phone number must be exactly 10 digits' }
    ),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  dob: z.string().optional(),

  // Preferences fields
  newsletterOptIn: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  promotionalEmails: z.boolean().optional(),
  language: z.string().optional(),

  // Privacy & Security fields
  twoFactorEnabled: z.boolean().optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

interface UseProfileFormOptions {
  initialData?: Partial<ProfileFormData>;
  onSuccess?: () => void;
}

export function useProfileForm({
  initialData,
  onSuccess,
}: UseProfileFormOptions = {}) {
  const defaultValues: ProfileFormData = {
    name: '',
    phone: '',
    gender: 'prefer_not_to_say',
    dob: '',
    newsletterOptIn: true,
    smsNotifications: false,
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: true,
    language: 'en',
    twoFactorEnabled: false,
    ...initialData,
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange', // Validate on change for better UX
  });

  // Store initial values for comparison
  const initialValuesRef = React.useRef<ProfileFormData>(defaultValues);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const newValues: ProfileFormData = {
        name: '',
        phone: '',
        gender: 'prefer_not_to_say',
        dob: '',
        newsletterOptIn: true,
        smsNotifications: false,
        emailNotifications: true,
        orderUpdates: true,
        promotionalEmails: true,
        language: 'en',
        twoFactorEnabled: false,
        ...initialData,
      };
      form.reset(newValues);
      initialValuesRef.current = newValues;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Only include fields that have changed
      const initialValues = initialValuesRef.current;
      const changes: Record<string, unknown> = {};

      // Compare each field and only include changed ones
      Object.keys(data).forEach((key) => {
        const fieldKey = key as keyof ProfileFormData;
        const currentValue = data[fieldKey];
        const initialValue = initialValues[fieldKey];

        // Skip undefined values
        if (currentValue === undefined) return;

        // Normalize empty strings and undefined for comparison (optional fields)
        // But keep the actual values for sending
        const normalizeForComparison = (val: unknown): unknown => {
          if (val === '' || val === null || val === undefined) return '';
          return val;
        };

        const currentNormalized = normalizeForComparison(currentValue);
        const initialNormalized = normalizeForComparison(initialValue);

        // Deep comparison for arrays
        if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
          if (
            currentValue.length !== initialValue.length ||
            currentValue.some((val, idx) => val !== initialValue[idx])
          ) {
            changes[fieldKey] = currentValue;
          }
        } else if (currentNormalized !== initialNormalized) {
          // Only add if actually changed (compare normalized, but send actual value)
          changes[fieldKey] = currentValue;
        }
      });

      // Don't send empty request
      if (Object.keys(changes).length === 0) {
        toastApi.success('No changes to save');
        return;
      }

      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
        credentials: 'include', // Include cookies for authentication
      });

      if (!res.ok) {
        let errorMessage = `Failed to save (${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage = errorData?.error || errorData?.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }
        console.error('Update failed:', {
          status: res.status,
          statusText: res.statusText,
          errorMessage,
          changes,
        });
        throw new Error(errorMessage);
      }

      toastApi.success('Profile saved');
      // Update initial values to current values after successful save
      initialValuesRef.current = { ...data };
      form.reset(data); // Reset form with new data to clear dirty state
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save changes';
      console.error('Profile update error:', error);
      toastApi.error('Save failed', message);
      throw error;
    }
  };

  const handleCancel = () => {
    form.reset();
  };

  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;
  const isValid = form.formState.isValid;

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleCancel,
    isDirty,
    isSubmitting,
    isValid,
  };
}

