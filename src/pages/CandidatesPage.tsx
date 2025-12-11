const CandidatesPage = () => (
  <div className="space-y-4">
    <div>
      <p className="text-sm uppercase tracking-wide text-navy/50">Talent pool</p>
      <h1 className="font-display text-2xl font-bold">Candidates</h1>
      <p className="mt-1 text-sm text-navy/60">Quickly scan through candidate cards and spot great matches.</p>
    </div>
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-navy/5 bg-background p-4 shadow-inner transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
              AM
            </div>
            <div>
              <h3 className="font-semibold text-navy">Avery Morris</h3>
              <p className="text-xs text-navy/60">Product Designer • SF</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-navy/70">
            Shipped several B2B workflows and led design sprints. Loves collaborating with PMs and engineers.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1 text-navy/70 shadow-sm">Figma</span>
            <span className="rounded-full bg-white px-3 py-1 text-navy/70 shadow-sm">UX Research</span>
            <span className="rounded-full bg-white px-3 py-1 text-navy/70 shadow-sm">Prototyping</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CandidatesPage;
