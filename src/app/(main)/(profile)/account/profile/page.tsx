'use client';

import { useEffect, useMemo, useState } from 'react';
import Container from '@/app/(main)/components/layouts/Container';
import { accountApi } from '@/lib/utils';
import type { UserAccount, AccountUpdatePayload } from '@/lib/utils';

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserAccount | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [dob, setDob] = useState('');

  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { user } = await accountApi.me();
        setProfile(user);
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setGender(user.gender || 'prefer_not_to_say');
          setDob(user.dob ? new Date(user.dob).toISOString().slice(0, 10) : '');
          setNewsletterOptIn(!!user.newsletterOptIn);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSave = useMemo(() => {
    return name.trim().length > 0;
  }, [name]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (!canSave) return;
    setSaving(true);
    try {
      const payload: AccountUpdatePayload = {
        name: name.trim(),
        phone,
        gender,
        dob,
        newsletterOptIn,
      };
      await accountApi.update(payload);
      setSuccess('Profile updated');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main>
      <Container>
        <div className="py-5 mt-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-heading bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] bg-clip-text text-transparent mb-4">
              My Account
            </h1>

            {loading ? (
              <p className="text-sm text-gray-600">Loading...</p>
            ) : !profile ? (
              <p className="text-sm text-gray-600">You are not logged in.</p>
            ) : (
              <div className="space-y-8">
                <section className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white/90 backdrop-blur-sm p-6 shadow">
                  <h2 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-4">
                    Profile
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Name
                      </label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Email
                      </label>
                      <input
                        value={email}
                        readOnly
                        className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Phone
                      </label>
                      <input
                        value={phone}
                        onChange={e =>
                          setPhone(
                            e.target.value.replace(/\D/g, '').slice(0, 15)
                          )
                        }
                        className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm"
                      >
                        <option value="prefer_not_to_say">
                          Prefer not to say
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        className="w-full rounded-lg border border-[oklch(0.84_0.04_10.35)] bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="col-span-full flex items-center gap-2">
                      <input
                        id="newsletter"
                        type="checkbox"
                        checked={newsletterOptIn}
                        onChange={e => setNewsletterOptIn(e.target.checked)}
                      />
                      <label
                        htmlFor="newsletter"
                        className="text-xs text-gray-600"
                      >
                        Subscribe to newsletter
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={!canSave || saving}
                      className={`rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-all ${
                        !canSave || saving
                          ? 'bg-[oklch(0.84_0.04_10.35)] cursor-not-allowed'
                          : 'bg-gradient-to-r from-[oklch(0.66_0.14_358.91)] to-[oklch(0.58_0.16_8)] hover:shadow-md'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    {success && (
                      <p className="text-xs text-green-700">{success}</p>
                    )}
                  </div>
                </section>

                <section className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white/90 backdrop-blur-sm p-6 shadow">
                  <h2 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-4">
                    Addresses
                  </h2>
                  <p className="text-sm text-gray-600">
                    Coming soon: manage your shipping and billing addresses
                    here.
                  </p>
                </section>

                <section className="rounded-xl border border-[oklch(0.84_0.04_10.35)]/30 bg-white/90 backdrop-blur-sm p-6 shadow">
                  <h2 className="text-base font-medium text-[oklch(0.39_0.09_17.83)] mb-4">
                    Security
                  </h2>
                  <p className="text-sm text-gray-600">
                    Coming soon: change password and manage login methods.
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
