const SettingsPage = () => (
  <div className="space-y-6">
    <div>
      <p className="text-sm uppercase tracking-wide text-navy/50">Admin</p>
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-navy/60">Manage workspace preferences and notifications.</p>
    </div>
    <div className="space-y-4">
      <div className="rounded-xl bg-background p-5 shadow-inner">
        <h2 className="text-lg font-semibold text-navy">Team notifications</h2>
        <p className="text-sm text-navy/60">Fine-tune which updates land in your inbox.</p>
        <div className="mt-3 space-y-2 text-sm text-navy/70">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="accent-accent" />
            Interview reminders
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="accent-accent" />
            New applicant summaries
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="accent-accent" />
            Weekly digest
          </label>
        </div>
      </div>
      <div className="rounded-xl bg-background p-5 shadow-inner">
        <h2 className="text-lg font-semibold text-navy">Branding</h2>
        <p className="text-sm text-navy/60">Keep things on-brand for your team.</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-navy/70">
          <button className="rounded-lg bg-accent px-4 py-2 text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
            Upload logo
          </button>
          <button className="rounded-lg border border-navy/10 px-4 py-2 text-navy/80 transition hover:-translate-y-0.5 hover:shadow-sm">
            Update brand colors
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsPage;
