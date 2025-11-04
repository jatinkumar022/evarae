import { useEffect, useState } from 'react';
import { ProfileFormData } from './useProfileForm';

interface ApiOrder {
  _id?: string;
  orderNumber?: string;
  totalAmount?: number;
  orderStatus?: string;
  createdAt?: string;
}

export function useProfileData() {
  const [profileData, setProfileData] = useState<Partial<ProfileFormData>>({});
  const [email, setEmail] = useState('');
  const [ordersPreview, setOrdersPreview] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/account/me', { cache: 'no-store' });
        const data = await res.json();
        const u = data?.user;
        
        if (u) {
          setEmail(u.email || '');
          const p = u.profile || {};
          
          const profile: Partial<ProfileFormData> = {
            name: u.name || '',
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
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Fetch orders preview
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/orders', { credentials: 'include' });
        const data = (await res.json()) as { orders?: ApiOrder[] };
        const list: ApiOrder[] = data?.orders || [];
        const normalized = list.map((o: ApiOrder) => ({
          _id: String(o._id || ''),
          orderNumber: o.orderNumber || o._id,
          totalAmount: o.totalAmount || 0,
          orderStatus: o.orderStatus || 'pending',
          createdAt: o.createdAt,
        }));
        setOrdersPreview(normalized);
      } catch {
        setOrdersPreview([]);
      }
    })();
  }, []);

  return {
    profileData,
    email,
    ordersPreview,
    isLoading,
    setProfileData, // Allow manual updates after save
  };
}

