import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please double-check and try again.');
      return;
    }

    setSubmitting(true);

    try {
      await register({ name, companyName, email, password });
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError('We could not create your account right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-white to-indigo-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col-reverse items-center justify-center gap-10 px-4 py-10 md:flex-row md:py-20">
        <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 p-10 text-white shadow-2xl shadow-indigo-200">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">Recruiter joy</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight">Welcome to your new superpower.</h2>
          <p className="mt-3 text-sm text-white/80">
            Automate scheduling, keep hiring managers aligned, and deliver offer-ready candidates faster.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/90">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">🤝</span>
              <div>
                <p className="font-semibold">Collaborate instantly</p>
                <p className="text-white/80">Share candidate notes and feedback without breaking stride.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">📣</span>
              <div>
                <p className="font-semibold">Personalized outreach</p>
                <p className="text-white/80">Craft tailored reach-outs that feel human, every time.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="w-full max-w-xl rounded-3xl bg-white/80 p-10 shadow-2xl shadow-indigo-100 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Create account</p>
          <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">Join HireFlow AI</h1>
          <p className="mt-2 text-sm text-navy/70">Set up your workspace for your recruiting team.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-navy">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner transition focus:border-accent focus:outline-none"
                  placeholder="Alex Morgan"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-navy">Company</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner transition focus:border-accent focus:outline-none"
                  placeholder="Aurora Recruiting"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-navy">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner transition focus:border-accent focus:outline-none"
                placeholder="you@recruiting.co"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-navy">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner transition focus:border-accent focus:outline-none"
                  placeholder="Create a password"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-navy">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner transition focus:border-accent focus:outline-none"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-accent to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Creating your space...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-navy/70">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
