import { useParams, useNavigate } from 'react-router-dom';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-navy/50">Job Detail</p>
          <h1 className="font-display text-3xl font-bold text-navy">Role Overview</h1>
          <p className="mt-1 text-sm text-navy/60">Detailed view for job ID: {id}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/jobs')}
          className="rounded-xl border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600"
        >
          Back to jobs
        </button>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
        <p className="text-sm text-navy/70">
          A detailed job profile will appear here. Use this page to review the description, collaborate with hiring managers, and
          manage candidates for this role.
        </p>
      </div>
    </div>
  );
};

export default JobDetailPage;
