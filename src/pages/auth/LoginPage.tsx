import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      const redirectTo = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/app/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError('We could not sign you in. Please check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-4 py-10 md:flex-row md:py-20">
        <div className="w-full max-w-xl rounded-3xl bg-white/80 p-10 shadow-2xl shadow-indigo-100 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Welcome back</p>
          <h1 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">Sign in to HireFlow AI</h1>
          <p className="mt-2 text-sm text-navy/70">Reconnect with your pipeline in seconds.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-navy">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner transition focus:border-accent focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-accent to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Signing you in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-navy/70">
            New to HireFlow?{' '}
            <Link to="/register" className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 p-10 text-white shadow-2xl shadow-indigo-200">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">Hire smarter</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight">Spend more time closing roles, not copying CVs.</h2>
          <p className="mt-3 text-sm text-white/80">
            HireFlow AI keeps every candidate and hiring manager aligned. Automate outreach, organize pipelines, and unlock the
            momentum recruiters crave.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg font-semibold">✨</span>
              <div>
                <p className="font-semibold">AI-first workflows</p>
                <p className="text-white/80">From sourcing to scheduling, let automations handle the busywork.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-lg font-semibold">⚡</span>
              <div>
                <p className="font-semibold">Pipeline clarity</p>
                <p className="text-white/80">Know exactly who to nudge next with real-time status updates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
