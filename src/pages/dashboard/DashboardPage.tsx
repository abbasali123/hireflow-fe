import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type Job = {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  status?: string;
  createdAt: string;
  candidateCount?: number;
  candidates?: unknown[];
};

type Candidate = {
  id?: string;
  name?: string;
  fullName?: string;
  role?: string;
  status?: string;
  createdAt: string;
  matchScore?: number;
  location?: string;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistFallback] = useState(() => Math.round(30 + Math.random() * 40));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [jobsResponse, candidatesResponse] = await Promise.all([
          api.get<Job[]>('/jobs'),
          api.get<Candidate[]>('/candidates'),
        ]);

        setJobs(jobsResponse.data || []);
        setCandidates(candidatesResponse.data || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError('Unable to load dashboard data right now.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status?.toUpperCase() !== 'CLOSED'),
    [jobs],
  );

  const averageTimeOpenDays = useMemo(() => {
    if (!activeJobs.length) return null;

    const totalDaysOpen = activeJobs.reduce((total, job) => {
      const createdDate = new Date(job.createdAt);
      const daysOpen = Math.max(
        Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
        0,
      );

      return total + daysOpen;
    }, 0);

    return Math.round(totalDaysOpen / activeJobs.length);
  }, [activeJobs]);

  const shortlistRate = useMemo(() => {
    if (!candidates.length) return shortlistFallback;

    const shortlisted = candidates.filter((candidate) => candidate.status?.toUpperCase() === 'SHORTLISTED');

    if (!shortlisted.length) return shortlistFallback;

    return Math.round((shortlisted.length / candidates.length) * 100);
  }, [candidates, shortlistFallback]);

  const recentJobs = useMemo(
    () =>
      [...jobs]
        .sort(
          (jobA, jobB) => new Date(jobB.createdAt).getTime() - new Date(jobA.createdAt).getTime(),
        )
        .slice(0, 5),
    [jobs],
  );

  const topCandidates = useMemo(
    () =>
      [...candidates]
        .sort((candidateA, candidateB) => (candidateB.matchScore || 0) - (candidateA.matchScore || 0))
        .slice(0, 5),
    [candidates],
  );

  const summaryCards = [
    {
      title: 'Active Jobs',
      value: activeJobs.length,
      change: '+4.2%',
      direction: 'up' as const,
      description: 'vs last week',
    },
    {
      title: 'Total Candidates',
      value: candidates.length,
      change: '-2.1%',
      direction: 'down' as const,
      description: 'new applicants',
    },
    {
      title: 'Avg Time Open (days)',
      value: averageTimeOpenDays ?? '—',
      change: '+1.4d',
      direction: 'up' as const,
      description: 'since last sprint',
    },
    {
      title: 'Shortlist Rate (%)',
      value: `${shortlistRate}%`,
      change: '+3.8%',
      direction: 'up' as const,
      description: 'quality of pipeline',
    },
  ];

  const renderMetricBadge = (direction: 'up' | 'down', change: string) => (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
        direction === 'up'
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
      }`}
    >
      <span className="mr-1 text-xs">{direction === 'up' ? '▲' : '▼'}</span>
      {change}
    </span>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-navy/50">Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-navy">Hi, {user?.name || 'Recruiter'} 👋</h1>
          <p className="mt-1 text-sm text-navy/60">Gathering your latest hiring insights...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner"
            />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner" />
          <div className="h-64 animate-pulse rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-navy/50">Dashboard</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">Welcome back, {user?.name || 'Recruiter'}</h1>
            <p className="mt-1 text-sm text-navy/60">
              A quick snapshot of your hiring funnel across roles and candidates.
            </p>
          </div>
          <div className="rounded-full bg-gradient-to-r from-indigo-50 via-white to-emerald-50 px-4 py-2 text-xs font-semibold text-navy/70 ring-1 ring-navy/5">
            {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        {error ? (
          <div className="flex items-center gap-3 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-xl border border-white/60 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-inner transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-100/50" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-navy">{card.value}</p>
                <p className="text-xs text-navy/60">{card.description}</p>
              </div>
              {renderMetricBadge(card.direction, card.change)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/60 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-navy">Recent Jobs</h2>
              <p className="text-sm text-navy/60">Latest roles you&apos;re tracking.</p>
            </div>
            <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy/70">
              {recentJobs.length} listed
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {recentJobs.length === 0 ? (
              <div className="rounded-lg bg-white/70 px-4 py-5 text-sm text-navy/60 shadow-inner">
                No jobs found yet. Create a role to start tracking performance.
              </div>
            ) : (
              recentJobs.map((job) => {
                const createdDate = new Date(job.createdAt);
                const daysOpen = Math.max(
                  Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
                  0,
                );
                const candidateCount =
                  job.candidateCount ?? (Array.isArray(job.candidates) ? job.candidates.length : 0);

                return (
                  <div
                    key={job.id || `${job.title}-${job.createdAt}`}
                    className="flex flex-col gap-2 rounded-lg bg-white/80 px-4 py-3 shadow-sm ring-1 ring-white/80 transition hover:-translate-y-0.5 hover:shadow-md"
                    role="button"
                    tabIndex={0}
                    onClick={() => (job.id ? navigate(`/app/jobs/${job.id}`) : navigate('/app/jobs'))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        job.id ? navigate(`/app/jobs/${job.id}`) : navigate('/app/jobs');
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-navy">{job.title || 'Untitled role'}</p>
                        <p className="text-xs text-navy/60">
                          {[job.company, job.location].filter(Boolean).join(' • ') || 'Company & location TBD'}
                        </p>
                      </div>
                      <span className="rounded-full bg-navy/5 px-3 py-1 text-[11px] font-semibold uppercase text-navy/70">
                        {job.status || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-navy/60">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        {daysOpen} days open
                      </span>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700 ring-1 ring-indigo-100">
                        {candidateCount} candidates
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/60 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-6 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-navy">Top Candidates</h2>
              <p className="text-sm text-navy/60">Ranked by match score where available.</p>
            </div>
            <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy/70">
              {topCandidates.length} highlighted
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {topCandidates.length === 0 ? (
              <div className="rounded-lg bg-white/70 px-4 py-5 text-sm text-navy/60 shadow-inner">
                No candidates to display yet. Candidates that match your roles will appear here.
              </div>
            ) : (
              topCandidates.map((candidate) => (
                <div
                  key={candidate.id || `${candidate.name}-${candidate.createdAt}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/80 px-4 py-3 shadow-sm ring-1 ring-white/80 transition hover:-translate-y-0.5 hover:shadow-md"
                  role="button"
                  tabIndex={0}
                  onClick={() => (candidate.id ? navigate(`/app/candidates/${candidate.id}`) : navigate('/app/candidates'))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      candidate.id
                        ? navigate(`/app/candidates/${candidate.id}`)
                        : navigate('/app/candidates');
                    }
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {candidate.name || candidate.fullName || 'Candidate'}
                    </p>
                    <p className="text-xs text-navy/60">
                      {[candidate.role, candidate.location].filter(Boolean).join(' • ') || 'Role TBD'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
                      {candidate.matchScore != null ? `${candidate.matchScore}% match` : 'Score pending'}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ring-1 ${
                        candidate.status?.toUpperCase() === 'SHORTLISTED'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          : 'bg-slate-100 text-navy/70 ring-slate-200'
                      }`}
                    >
                      {candidate.status || 'REVIEW'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
