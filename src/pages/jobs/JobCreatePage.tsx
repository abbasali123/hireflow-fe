import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const JobCreatePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [seniority, setSeniority] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/jobs', {
        title,
        company,
        location,
        seniority,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        description,
        requiredSkills: requiredSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      navigate('/app/jobs');
    } catch (submitError) {
      console.error(submitError);
      setError('Could not create the job right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-navy/50">Create</p>
          <h1 className="font-display text-3xl font-bold text-navy">New Job</h1>
          <p className="mt-1 text-sm text-navy/60">Define the essentials for this role to keep hiring aligned.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Job title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="Product Manager"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Company</label>
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              required
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="HireFlow"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Location</label>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="Remote / San Francisco"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Seniority</label>
            <input
              type="text"
              value={seniority}
              onChange={(event) => setSeniority(event.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="Senior"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Salary range (min)</label>
            <input
              type="number"
              value={salaryMin}
              onChange={(event) => setSalaryMin(event.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="90000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Salary range (max)</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(event) => setSalaryMax(event.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="140000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-navy">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
            placeholder="Outline responsibilities, expectations, and team context."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-navy">Required skills</label>
          <input
            type="text"
            value={requiredSkills}
            onChange={(event) => setRequiredSkills(event.target.value)}
            className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
            placeholder="e.g. React, TypeScript, Product discovery"
          />
          <p className="text-xs text-navy/50">Separate each skill with a comma.</p>
        </div>

        {error ? (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/jobs')}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-navy transition hover:text-indigo-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Creating...' : 'Create job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobCreatePage;
