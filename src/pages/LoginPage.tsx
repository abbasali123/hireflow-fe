import { Link } from 'react-router-dom';

const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft">
      <h1 className="mb-3 text-3xl font-bold text-navy">Welcome back</h1>
      <p className="mb-6 text-sm text-navy/60">Sign in to continue to HireFlow AI.</p>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border border-navy/10 px-4 py-3 text-sm focus:border-accent focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-navy/10 px-4 py-3 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          Log in
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-navy/60">
        New here?{' '}
        <Link to="/register" className="font-semibold text-accent">
          Create an account
        </Link>
      </p>
    </div>
  </div>
);

export default LoginPage;
