import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h3A2.25 2.25 0 0 1 11.25 6v3A2.25 2.25 0 0 1 9 11.25H6A2.25 2.25 0 0 1 3.75 9zM3.75 15A2.25 2.25 0 0 1 6 12.75h3A2.25 2.25 0 0 1 11.25 15v3A2.25 2.25 0 0 1 9 20.25H6A2.25 2.25 0 0 1 3.75 18zM12.75 6A2.25 2.25 0 0 1 15 3.75h3A2.25 2.25 0 0 1 20.25 6v3A2.25 2.25 0 0 1 18 11.25h-3A2.25 2.25 0 0 1 12.75 9zM12.75 15A2.25 2.25 0 0 1 15 12.75h3A2.25 2.25 0 0 1 20.25 15v3A2.25 2.25 0 0 1 18 20.25h-3A2.25 2.25 0 0 1 12.75 18z"
    />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 6.75V5.25A2.25 2.25 0 0 1 10.5 3h3a2.25 2.25 0 0 1 2.25 2.25v1.5M4.5 9h15.75M7.5 18.75h9M5.25 21h13.5A2.25 2.25 0 0 0 21 18.75v-9A2.25 2.25 0 0 0 18.75 7.5h-13.5A2.25 2.25 0 0 0 3 9.75v9A2.25 2.25 0 0 0 5.25 21"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.75a4.5 4.5 0 0 0-4.5-4.5h-3a4.5 4.5 0 0 0-4.5 4.5m12-10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.75 8.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 10.5a4.48 4.48 0 0 0-1.284-3.182A4.48 4.48 0 0 0 3 18.75m15-10.5a4.48 4.48 0 0 0 1.284-3.182A4.48 4.48 0 0 0 21 8.25m-6.75 10.5a4.48 4.48 0 0 0 1.284-3.182A4.48 4.48 0 0 0 18 18.75"
    />
  </svg>
);

const PipelineIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12h15M6.75 7.5v9m10.5-9v9M3 7.5h18M3 16.5h18"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.094c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.781l.893.15c.543.09.94.56.94 1.109v1.095c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.15.894c-.09.542-.56.94-1.11.94H11.45c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.205.108l-.737.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.107-1.204-.165-.397-.505-.71-.93-.781l-.893-.15C3.398 13.97 3 13.5 3 12.95v-1.095c0-.55.398-1.02.94-1.11l.893-.149c.425-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.774-.773a1.125 1.125 0 0 1 1.449-.12l.738.527c.35.25.806.272 1.203.107.397-.165.71-.505.781-.929z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5 text-slate-400"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.75 6.75 7.5 7.5 0 0 0 16.65 16.65Z" />
  </svg>
);

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.25a2.25 2.25 0 0 1-4.714 0m9.107-2.625c-.621-.542-1.16-1.29-1.16-2.496V9.75A6 6 0 0 0 7.5 9.75v2.379c0 1.206-.539 1.954-1.16 2.496-.356.31-.59.764-.59 1.254 0 .69.56 1.246 1.25 1.246h11.204c.69 0 1.25-.555 1.25-1.246 0-.49-.234-.944-.59-1.254Z"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-4 w-4"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
  </svg>
);

type NavItem = {
  to: string;
  label: string;
  Icon: () => JSX.Element;
};

const navItems: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/app/jobs', label: 'Jobs', Icon: BriefcaseIcon },
  { to: '/app/candidates', label: 'Candidates', Icon: UsersIcon },
  { to: '/app/pipeline', label: 'Pipeline', Icon: PipelineIcon },
  { to: '/app/settings', label: 'Settings', Icon: SettingsIcon },
];

const SidebarLink = ({ to, label, Icon }: NavItem) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 hover:translate-x-[1px] hover:scale-[1.01] hover:bg-indigo-50/70 hover:text-indigo-600 active:scale-[0.99] ${
        isActive
          ? 'border-l-4 border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
          : 'border-l-4 border-transparent text-slate-600'
      }`
    }
  >
    <Icon />
    <span>{label}</span>
    <span
      className="absolute inset-y-1 left-0 w-1 rounded-full bg-indigo-500 opacity-0 transition group-hover:opacity-30"
      aria-hidden
    />
  </NavLink>
);

const ProfileDropdown = ({
  name,
  onLogout,
  onClose,
}: {
  name: string;
  onLogout: () => void;
  onClose: () => void;
}) => (
  <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5">
    <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Signed in as</div>
    <div className="px-3 pb-2 text-sm font-semibold text-slate-700">{name}</div>
    <button
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50"
      type="button"
    >
      Profile
    </button>
    <button
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
      type="button"
      onClick={() => {
        onLogout();
        onClose();
      }}
    >
      Logout
    </button>
  </div>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <aside className="fixed inset-y-0 left-0 w-[260px] border-r border-slate-200 bg-white px-6 py-7 shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-lg font-bold text-white shadow-sm">
            HF
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">HireFlow</p>
            <p className="font-display text-xl font-bold text-slate-900 leading-tight">AI Recruiter</p>
          </div>
        </div>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>
      </aside>

      <div className="ml-[260px] flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-5 border-b border-slate-200 bg-[#F7F7FB]/90 px-8 py-4 backdrop-blur">
          <div className="relative flex flex-1 max-w-xl items-center">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search candidates, jobs..."
              className="w-full rounded-full border border-slate-200 bg-white px-10 py-2 text-sm font-medium text-slate-700 shadow-inner outline-none ring-0 transition focus:border-indigo-300 focus:shadow-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-[1.02] hover:border-indigo-200 hover:text-indigo-600"
              aria-label="Notifications"
            >
              <BellIcon />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:scale-[1.01] hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-bold text-white">
                  {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
                </span>
                <span className="pr-1">{user?.name || user?.email || 'Abbas'}</span>
                <ChevronDownIcon />
              </button>
              {isProfileOpen && (
                <ProfileDropdown name={user?.name || 'Abbas'} onLogout={logout} onClose={() => setIsProfileOpen(false)} />
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
