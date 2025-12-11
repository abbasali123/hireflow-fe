import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import api from '../../api/client';

const pipelineColumns = [
  { key: 'SOURCED', label: 'Sourced', color: 'bg-sky-500', soft: 'bg-sky-50' },
  { key: 'CONTACTED', label: 'Contacted', color: 'bg-indigo-500', soft: 'bg-indigo-50' },
  { key: 'INTERVIEWING', label: 'Interviewing', color: 'bg-amber-500', soft: 'bg-amber-50' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-emerald-500', soft: 'bg-emerald-50' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-rose-500', soft: 'bg-rose-50' },
] as const;

type PipelineStatus = (typeof pipelineColumns)[number]['key'];

type Candidate = {
  id: string;
  name: string;
  title?: string;
  skills?: string[];
  matchScore?: number;
  status?: PipelineStatus;
};

type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string;
  seniority?: string;
  salaryRange?: string;
  requiredSkills?: string[];
  description?: string;
  candidates?: Candidate[];
};

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [board, setBoard] = useState<Record<PipelineStatus, Candidate[]>>({
    SOURCED: [],
    CONTACTED: [],
    INTERVIEWING: [],
    SHORTLISTED: [],
    REJECTED: [],
  });
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      setLoadingJob(true);
      setError(null);

      try {
        const response = await api.get<JobDetail>(`/jobs/${id}`);
        const jobData = response.data || null;
        setJob(jobData);

        const initialCandidates = (jobData?.candidates || []).map((candidate) => ({
          ...candidate,
          status: (candidate.status || 'SOURCED') as PipelineStatus,
        }));

        setBoard((previous) => {
          const nextBoard: Record<PipelineStatus, Candidate[]> = {
            ...previous,
            SOURCED: [],
            CONTACTED: [],
            INTERVIEWING: [],
            SHORTLISTED: [],
            REJECTED: [],
          };

          initialCandidates.forEach((candidate) => {
            const status = candidate.status || 'SOURCED';
            nextBoard[status].push(candidate);
          });

          return nextBoard;
        });
      } catch (fetchError) {
        console.error(fetchError);
        setError('Unable to load job details right now. Please try again.');
      } finally {
        setLoadingJob(false);
      }
    };

    const fetchCandidates = async () => {
      setLoadingCandidates(true);

      try {
        const response = await api.get<Candidate[]>('/candidates');
        setAllCandidates(response.data || []);
      } catch (fetchError) {
        console.error(fetchError);
      } finally {
        setLoadingCandidates(false);
      }
    };

    void fetchJob();
    void fetchCandidates();
  }, [id]);

  const availableCandidates = useMemo(
    () =>
      allCandidates.filter(
        (candidate) =>
          !Object.values(board)
            .flat()
            .some((linked) => linked.id === candidate.id),
      ),
    [allCandidates, board],
  );

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId as PipelineStatus;
    const destinationStatus = destination.droppableId as PipelineStatus;

    const movingCandidate = board[sourceStatus][source.index];

    const updatedBoard = { ...board };
    updatedBoard[sourceStatus] = Array.from(board[sourceStatus]);
    updatedBoard[destinationStatus] = Array.from(board[destinationStatus]);

    updatedBoard[sourceStatus].splice(source.index, 1);
    updatedBoard[destinationStatus].splice(destination.index, 0, {
      ...movingCandidate,
      status: destinationStatus,
    });

    setBoard(updatedBoard);

    try {
      await api.put(`/jobs/${id}/candidates/${movingCandidate.id}/status`, {
        status: destinationStatus,
      });
    } catch (updateError) {
      console.error(updateError);
      setBoard(board);
    }
  };

  const handleAttachCandidate = async () => {
    if (!selectedCandidateId || !id) return;

    try {
      await api.post(`/jobs/${id}/candidates/${selectedCandidateId}/link`);
      const newCandidate = allCandidates.find((candidate) => candidate.id === selectedCandidateId);
      if (newCandidate) {
        setBoard((previous) => ({
          ...previous,
          SOURCED: [...previous.SOURCED, { ...newCandidate, status: 'SOURCED' }],
        }));
      }
      setSelectedCandidateId('');
      setAttachOpen(false);
    } catch (linkError) {
      console.error(linkError);
    }
  };

  const handleGenerateAiJd = async () => {
    setAiModalOpen(true);
    setAiLoading(true);
    setAiContent('');

    try {
      const payload = job ? { jobId: job.id, title: job.title, description: job.description } : { jobId: id };
      const response = await api.post<{ content: string }>('/ai/generate-jd', payload);
      setAiContent((response.data as { content?: string })?.content || 'AI generated job description will appear here.');
    } catch (aiError) {
      console.error(aiError);
      setAiContent('We could not generate a JD right now. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  const renderCandidateCard = (candidate: Candidate, accent: string) => (
    <div
      key={candidate.id}
      className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-navy/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${accent}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-navy">{candidate.name}</p>
          <p className="text-xs text-navy/60">
            {candidate.title || candidate.skills?.slice(0, 3).join(', ') || 'Skills unavailable'}
          </p>
        </div>
        {typeof candidate.matchScore === 'number' && (
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-600 ring-1 ring-indigo-100">
            {candidate.matchScore}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-navy/50">Job Detail</p>
          <h1 className="font-display text-3xl font-bold text-navy">{job?.title || 'Role Overview'}</h1>
          <p className="mt-1 text-sm text-navy/60">Manage this role and the candidate pipeline.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerateAiJd}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
          >
            Generate JD with AI
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/jobs')}
            className="rounded-xl border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600"
          >
            Back to jobs
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
          {loadingJob ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-3/4 rounded bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="h-4 w-5/6 rounded bg-slate-100" />
              <div className="h-24 w-full rounded bg-slate-100" />
            </div>
          ) : job ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-navy">{job.title}</h2>
                <p className="text-sm text-navy/70">{job.company}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm text-navy/80">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-navy">Location</span>
                  <span>{job.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-navy">Seniority</span>
                  <span>{job.seniority || '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold text-navy">Salary Range</span>
                  <span>{job.salaryRange || '—'}</span>
                </div>
              </div>
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-navy">Required skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-navy">Description</p>
                <p className="mt-2 text-sm text-navy/70 whitespace-pre-line">{job.description || 'No description provided.'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-navy/70">Job not found.</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-navy">Candidate Pipeline</h2>
              <p className="text-sm text-navy/60">Drag candidates between stages to update their status.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAttachOpen(true)}
                className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Attach Candidate
              </button>
            </div>
          </div>

          {loadingJob ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5">
                  <div className="mb-3 h-5 w-2/3 rounded bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-slate-100" />
                    <div className="h-4 w-5/6 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pipelineColumns.map((column) => (
                  <Droppable droppableId={column.key} key={column.key}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex min-h-[260px] flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`h-3 w-3 rounded-full ${column.color}`} aria-hidden />
                            <h3 className="text-sm font-semibold text-navy">{column.label}</h3>
                          </div>
                          <span className="rounded-full bg-slate-50 px-2 py-1 text-[11px] font-semibold text-navy/70 ring-1 ring-slate-100">
                            {board[column.key].length}
                          </span>
                        </div>

                        <div className={`flex flex-1 flex-col gap-3 rounded-xl ${column.soft} p-2`}>
                          {board[column.key].length === 0 && (
                            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-navy/10 bg-white/50 p-3 text-xs text-navy/50">
                              {column.key === 'SOURCED'
                                ? 'No candidates yet. Attach your first candidate to this job.'
                                : 'Drag candidates here to move them into this stage.'}
                            </div>
                          )}
                          {board[column.key].map((candidate, index) => (
                            <Draggable draggableId={`${candidate.id}-${column.key}`} index={index} key={`${candidate.id}-${column.key}`}>
                              {(draggableProvided, snapshot) => (
                                <div
                                  ref={draggableProvided.innerRef}
                                  {...draggableProvided.draggableProps}
                                  {...draggableProvided.dragHandleProps}
                                  className={`transition ${snapshot.isDragging ? 'rotate-1 scale-[1.01]' : ''}`}
                                >
                                  {renderCandidateCard(candidate, column.color)}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {attachOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy">Attach Candidate</h3>
              <button
                type="button"
                onClick={() => setAttachOpen(false)}
                className="text-sm font-semibold text-navy/60 transition hover:text-navy"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm text-navy/60">
              Select a candidate from your workspace to link to this job. Newly attached candidates will start in the Sourced stage.
            </p>
            <div className="mt-4">
              {loadingCandidates ? (
                <div className="text-sm text-navy/60">Loading candidates...</div>
              ) : availableCandidates.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-navy/60 ring-1 ring-navy/5">
                  No available candidates to attach.
                </div>
              ) : (
                <select
                  className="w-full rounded-xl border border-navy/10 px-3 py-2 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300"
                  value={selectedCandidateId}
                  onChange={(event) => setSelectedCandidateId(event.target.value)}
                >
                  <option value="">Select candidate</option>
                  {availableCandidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} {candidate.title ? `• ${candidate.title}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAttachOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-navy/70 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAttachCandidate}
                disabled={!selectedCandidateId}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition enabled:hover:-translate-y-0.5 enabled:hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Attach
              </button>
            </div>
          </div>
        </div>
      )}

      {aiModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy">AI Generated JD</h3>
                <p className="text-sm text-navy/60">Preview of the generated job description.</p>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="text-sm font-semibold text-navy/60 transition hover:text-navy"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 min-h-[140px] rounded-xl bg-slate-50 p-4 text-sm text-navy/80 ring-1 ring-navy/5">
              {aiLoading ? 'Generating with AI...' : aiContent || 'No content available yet.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
