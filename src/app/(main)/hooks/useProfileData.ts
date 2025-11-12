import { useEffect, useState, useMemo } from 'react';
import { ProfileFormData } from './useProfileForm';
import { useUserAccountStore } from '@/lib/data/mainStore/userAccountStore';
import { useOrdersStore } from '@/lib/data/mainStore/ordersStore';

interface ApiOrder {
  _id?: string;
  orderNumber?: string;
  totalAmount?: number;
  orderStatus?: string;
  createdAt?: string;
}

export function useProfileData() {
  const { user, status: userStatus } = useUserAccountStore();
  const [profileData, setProfileData] = useState<Partial<ProfileFormData>>({});
  const [ordersPreview, setOrdersPreview] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive profile data from centralized user store
  const email = useMemo(() => user?.email || '', [user?.email]);
  const hasPassword = useMemo(() => {
    // Check if user has password (not Google sign-in)
    // This info should come from user store, but for now we'll assume true if user exists
    return user !== null;
  }, [user]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      const p = (user as any).profile || {};
      const profile: Partial<ProfileFormData> = {
        name: user.name || '',
        phone: p.phone || '',
        gender: p.gender || 'prefer_not_to_say',
        dob: p.dob
          ? new Date(p.dob).toISOString().slice(0, 10)
          : '',
        newsletterOptIn: !!p.newsletterOptIn,
        smsNotifications: !!p.smsNotifications,
        emailNotifications: !!p.emailNotifications,
        orderUpdates: !!p.orderUpdates,
        promotionalEmails: !!p.promotionalEmails,
        language: p.language || 'en',
        twoFactorEnabled: !!p.twoFactorEnabled,
      };
      setProfileData(profile);
      setIsLoading(userStatus === 'loading');
    } else {
      setIsLoading(userStatus === 'loading');
    }
  }, [user, userStatus]);

  // Orders are now loaded via orders store (see orders history page)
  // For profile page preview, we'll use a subset from the store if available
  const { orders } = useOrdersStore();
  
  useEffect(() => {
    // Use orders from store for preview (first 5 orders)
    const preview = orders.slice(0, 5).map(o => ({
      _id: String(o._id || ''),
      orderNumber: o.orderNumber || o._id,
      totalAmount: o.totalAmount || 0,
      orderStatus: o.orderStatus || 'pending',
      createdAt: o.createdAt,
    }));
    setOrdersPreview(preview);
  }, [orders]);

  return {
    profileData,
    email,
    hasPassword,
    ordersPreview,
    isLoading,
    setProfileData, // Allow manual updates after save
  };
}

