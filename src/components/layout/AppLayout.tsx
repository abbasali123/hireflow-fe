import { PropsWithChildren } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/jobs', label: 'Jobs' },
  { to: '/app/candidates', label: 'Candidates' },
  { to: '/app/pipeline', label: 'Pipeline' },
  { to: '/app/settings', label: 'Settings' },
];

const SearchIcon = () => (
  <svg
    className="h-5 w-5 text-navy/40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="16.65" y1="16.65" x2="21" y2="21" />
  </svg>
);

const DropdownIcon = () => (
  <svg
    className="h-4 w-4 text-navy/60"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 7 10 13 16 7" />
  </svg>
);

const SidebarLink = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 hover:bg-white/60 hover:shadow-sm ${
        isActive
          ? 'bg-white text-accent shadow-soft'
          : 'text-navy/70 hover:text-navy'
      }`
    }
  >
    <span className="text-base">{label}</span>
  </NavLink>
);

const UserBadge = ({ name }: { name: string }) => (
  <button className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm transition hover:shadow-md">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-indigo-500 text-white font-semibold">
      {name.charAt(0)}
    </div>
    <div className="text-left">
      <p className="text-sm font-semibold text-navy">{name}</p>
      <p className="text-xs text-navy/60">Talent Lead</p>
    </div>
    <DropdownIcon />
  </button>
);

const PageShell = ({ children }: PropsWithChildren) => (
  <div className="min-h-screen bg-background font-body text-navy">
    <div className="mx-auto flex max-w-7xl gap-6 px-6 py-10">
      <aside className="w-64 shrink-0 rounded-2xl bg-white p-6 shadow-soft">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white text-xl font-bold shadow-soft">
            HF
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-navy/60">HireFlow</p>
            <p className="font-display text-xl font-bold leading-tight">HireFlow AI</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <SidebarLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="mb-6 flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-soft">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-navy/5 bg-background px-4 py-2 shadow-inner">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search candidates or jobs..."
              className="w-full border-none bg-transparent text-sm text-navy/80 placeholder:text-navy/40 focus:outline-none"
            />
          </div>
          <UserBadge name="Alex Morgan" />
        </header>
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          {children}
        </div>
      </main>
    </div>
  </div>
);

const AppLayout = () => (
  <PageShell>
    <Outlet />
  </PageShell>
);

export default AppLayout;
