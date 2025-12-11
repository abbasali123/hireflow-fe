import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  status: string;
  createdAt: string;
  description?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
  DRAFT: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  CLOSED: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
};

const formatRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays)) return '—';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
};

const JobsListPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<Job[]>('/jobs');
        setJobs(response.data || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError('Unable to load jobs right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;

    const query = searchTerm.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query),
    );
  }, [jobs, searchTerm]);

  const activeJobsCount = useMemo(
    () => jobs.filter((job) => job.status.toUpperCase() !== 'CLOSED').length,
    [jobs],
  );

  const handleRowClick = (jobId: string) => {
    navigate(`/app/jobs/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-navy/50">Hiring Workspace</p>
          <h1 className="font-display text-3xl font-bold text-navy">Jobs Management</h1>
          <p className="mt-1 text-sm text-navy/60">Track every opening, status, and action in one place.</p>
        </div>
        <Link
          to="/app/jobs/new"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          + Create Job
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Total Jobs</p>
          <p className="mt-2 text-3xl font-bold text-navy">{jobs.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Active Jobs</p>
          <p className="mt-2 text-3xl font-bold text-navy">{activeJobsCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-navy/40">
            ⌕
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-navy/10">
          <thead className="bg-slate-50/70">
            <tr>
              {['Job Title', 'Company', 'Location', 'Status', 'Created', 'Actions'].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-navy/60"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-navy/60">
                  Loading jobs...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-6">
                  <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
                    {error}
                  </div>
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-navy/60">
                  No jobs found. Try adjusting your search or create a new role.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => {
                const statusKey = job.status?.toUpperCase() || 'DRAFT';
                return (
                  <tr
                    key={job.id}
                    onClick={() => handleRowClick(job.id)}
                    className="cursor-pointer transition hover:bg-indigo-50/40"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-navy">{job.title}</div>
                      <p className="text-xs text-navy/60">{job.description?.slice(0, 80)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-navy/80">{job.company}</td>
                    <td className="px-6 py-4 text-sm text-navy/80">{job.location}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[statusKey] || statusStyles.DRAFT
                        }`}
                      >
                        {statusKey.charAt(0) + statusKey.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-navy/70">{formatRelativeTime(job.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-full px-2 py-1 text-xl text-navy/50 transition hover:bg-slate-100 hover:text-navy/70"
                        aria-label="Job actions"
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobsListPage;
