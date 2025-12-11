const columns = [
  { title: 'Sourced', count: 12 },
  { title: 'Screening', count: 8 },
  { title: 'Interview', count: 6 },
  { title: 'Offer', count: 2 },
];

const PipelinePage = () => (
  <div className="space-y-4">
    <div>
      <p className="text-sm uppercase tracking-wide text-navy/50">Flow</p>
      <h1 className="font-display text-2xl font-bold">Pipeline</h1>
      <p className="mt-1 text-sm text-navy/60">Visualize candidate progress and keep momentum strong.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-4">
      {columns.map((column) => (
        <div key={column.title} className="rounded-xl bg-background p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy">{column.title}</h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-navy/70 shadow-sm">
              {column.count}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-navy/70">
            <div className="rounded-lg bg-white px-3 py-2 shadow-sm">Candidate card</div>
            <div className="rounded-lg bg-white px-3 py-2 shadow-sm">Candidate card</div>
            <div className="rounded-lg bg-white px-3 py-2 shadow-sm">Candidate card</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PipelinePage;
