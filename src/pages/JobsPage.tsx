const JobsPage = () => (
  <div className="space-y-4">
    <div>
      <p className="text-sm uppercase tracking-wide text-navy/50">Open roles</p>
      <h1 className="font-display text-2xl font-bold">Jobs</h1>
      <p className="mt-1 text-sm text-navy/60">Track active roles and collaborate with hiring managers.</p>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-navy/5 bg-background px-5 py-4 shadow-inner transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-navy">Product Designer</h3>
              <p className="text-xs text-navy/60">San Francisco • Hybrid</p>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Active</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-navy/60">
            <span>24 candidates</span>
            <span>6 interviews</span>
            <span>2 offers</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default JobsPage;
