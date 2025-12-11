import { Link } from 'react-router-dom';

const RegisterPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft">
      <h1 className="mb-3 text-3xl font-bold text-navy">Create your account</h1>
      <p className="mb-6 text-sm text-navy/60">Join HireFlow AI to level up your recruiting.</p>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          className="w-full rounded-xl border border-navy/10 px-4 py-3 text-sm focus:border-accent focus:outline-none"
        />
        <input
          type="email"
          placeholder="Work email"
          className="w-full rounded-xl border border-navy/10 px-4 py-3 text-sm focus:border-accent focus:outline-none"
        />
        <input
          type="password"
          placeholder="Create a password"
          className="w-full rounded-xl border border-navy/10 px-4 py-3 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          Sign up
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-navy/60">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent">
          Log in
        </Link>
      </p>
    </div>
  </div>
);

export default RegisterPage;
