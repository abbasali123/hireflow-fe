import { ChangeEventHandler, FormEvent, useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type ProfileFormState = {
  name: string;
  companyName: string;
  email: string;
  bio: string;
};

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

const tabs = [
  { id: 'profile', label: 'Profile', description: 'Personal details & preferences' },
  { id: 'workspace', label: 'Workspace', description: 'Workspace settings', disabled: true },
];

const getInitials = (name?: string, email?: string) => {
  if (name?.trim()) {
    const [first, second] = name.trim().split(/\s+/);
    return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase() || 'HF';
  }

  return email?.slice(0, 2).toUpperCase() || 'HF';
};

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState<ToastState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<ProfileFormState>({
    name: user?.name ?? '',
    companyName: user?.companyName ?? '',
    email: user?.email ?? '',
    bio: '',
  });

  useEffect(() => {
    if (!user) return;

    setFormState((previous) => ({
      ...previous,
      name: user.name ?? '',
      companyName: user.companyName ?? '',
      email: user.email ?? '',
    }));
  }, [user]);

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const initials = useMemo(() => getInitials(formState.name, formState.email), [formState.email, formState.name]);

  const handleInputChange = (field: keyof ProfileFormState): ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    (event) => {
      const { value } = event.target;
      setFormState((previous) => ({ ...previous, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setToast(null);

    try {
      await api.put('/me', {
        name: formState.name.trim(),
        companyName: formState.companyName.trim(),
        bio: formState.bio.trim() || undefined,
      });

      setToast({ type: 'success', message: 'Your profile was updated successfully.' });
    } catch (error) {
      console.error(error);
      setToast({ type: 'error', message: 'Unable to save changes right now. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-slate-400">Settings</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">HireFlow AI settings</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your personal details and workspace preferences.</p>
          </div>
          <div className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            {user?.companyName || 'Workspace'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => setActiveTab(tab.id)}
            className={`flex min-w-[220px] flex-1 flex-col gap-1 rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
              activeTab === tab.id
                ? 'border-indigo-200 bg-white text-indigo-700 ring-2 ring-indigo-100'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-100 hover:bg-white'
            } ${tab.disabled ? 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-sm' : ''}`}
          >
            <span className="text-sm font-semibold">{tab.label}</span>
            <span className="text-xs text-slate-500">{tab.description}</span>
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Profile</p>
              <h2 className="font-display text-xl font-semibold text-slate-900">Personal information</h2>
              <p className="text-sm text-slate-600">Keep your profile details up to date for teammates and candidates.</p>
            </div>
            <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">
              Securely stored
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 px-6 py-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700 ring-8 ring-indigo-50">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Profile photo</p>
                <p className="text-sm text-slate-600">Your initials will be used across the workspace until you upload an avatar.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                Full name
                <input
                  type="text"
                  value={formState.name}
                  onChange={handleInputChange('name')}
                  placeholder="Enter your full name"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-inner transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                Company
                <input
                  type="text"
                  value={formState.companyName}
                  onChange={handleInputChange('companyName')}
                  placeholder="Where do you work?"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-inner transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                Work email
                <input
                  type="email"
                  value={formState.email}
                  readOnly
                  className="cursor-not-allowed rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal text-slate-500 shadow-inner"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                Bio (optional)
                <textarea
                  value={formState.bio}
                  onChange={handleInputChange('bio')}
                  rows={3}
                  placeholder="Add a short bio for teammates and hiring managers."
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-inner transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                Changes save securely to your profile.
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormState({
                      name: user?.name ?? '',
                      companyName: user?.companyName ?? '',
                      email: user?.email ?? '',
                      bio: '',
                    })
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-sm"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {toast ? (
        <div
          className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <span className="text-lg" aria-hidden>
            {toast.type === 'success' ? '✓' : '⚠️'}
          </span>
          <div className="text-sm">
            <p className="font-semibold">{toast.type === 'success' ? 'Profile saved' : 'Update failed'}</p>
            <p>{toast.message}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SettingsPage;
