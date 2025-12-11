const stats = [
  { label: 'Open roles', value: '24', trend: '+3 this week' },
  { label: 'New candidates', value: '128', trend: '+18% vs last week' },
  { label: 'Interviews', value: '42', trend: '7 today' },
];

const DashboardPage = () => (
  <div className="space-y-6">
    <div>
      <p className="text-sm uppercase tracking-wide text-navy/50">Welcome back</p>
      <h1 className="font-display text-3xl font-bold">Morning, Alex</h1>
      <p className="mt-1 text-sm text-navy/60">Here&apos;s a quick overview of your hiring pipeline.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-navy/5 bg-background px-5 py-4 shadow-inner transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <p className="text-sm text-navy/60">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-navy">{stat.value}</p>
          <p className="text-xs font-medium text-accent">{stat.trend}</p>
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-navy/5 bg-background p-6 shadow-inner">
      <h2 className="font-display text-xl font-semibold">Today&apos;s highlights</h2>
      <p className="mt-2 text-sm text-navy/60">
        Keep momentum going—follow up with candidates who moved to interview and review fresh applications.
      </p>
      <ul className="mt-4 space-y-3 text-sm">
        <li className="flex items-center gap-3 rounded-lg bg-white/70 px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          3 candidates awaiting feedback for Product Designer
        </li>
        <li className="flex items-center gap-3 rounded-lg bg-white/70 px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          2 interviews scheduled today for Backend Engineer
        </li>
        <li className="flex items-center gap-3 rounded-lg bg-white/70 px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
          7 new applicants arrived overnight
        </li>
      </ul>
    </div>
  </div>
);

export default DashboardPage;
