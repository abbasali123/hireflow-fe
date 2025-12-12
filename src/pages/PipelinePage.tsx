import { useEffect, useMemo, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DroppableProvided,
  type DropResult,
} from '@hello-pangea/dnd';
import api from '../api/client';

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
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  resumeUrl?: string;
  summary?: string | null;
  rawText?: string | null;
  skills?: string[];
  experience?: { title?: string; years?: number; company?: string }[];
  education?: { degree?: string; school?: string; graduationYear?: number }[];
  createdAt?: string;
};

type JobCandidate = {
  id: string;
  jobId: string;
  candidateId: string;
  status: PipelineStatus;
  matchScore?: number | null;
  notes?: string | null;
  candidate: Candidate;
};

type PipelineCandidate = Candidate & {
  jobCandidateId: string;
  status: PipelineStatus;
  matchScore?: number | null;
  notes?: string | null;
};

type Job = {
  id: string;
  title: string;
  company?: string;
};

const PipelinePage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [board, setBoard] = useState<Record<PipelineStatus, PipelineCandidate[]>>({
    SOURCED: [],
    CONTACTED: [],
    INTERVIEWING: [],
    SHORTLISTED: [],
    REJECTED: [],
  });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      setError(null);

      try {
        const response = await api.get<Job[]>('/jobs');
        const jobList = response.data || [];
        setJobs(jobList);
        if (jobList.length > 0) {
          setSelectedJobId((previous) => previous || jobList[0].id);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError('Unable to load jobs. Please try again.');
      } finally {
        setLoadingJobs(false);
      }
    };

    void fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    const fetchPipeline = async () => {
      setLoadingBoard(true);
      setError(null);

      try {
        const response = await api.get<JobCandidate[]>(`/jobs/${selectedJobId}/candidates`);
        const candidates = (response.data || []).map((jobCandidate) => ({
          ...jobCandidate.candidate,
          jobCandidateId: jobCandidate.id,
          status: (jobCandidate.status || 'SOURCED') as PipelineStatus,
          matchScore: jobCandidate.matchScore,
          notes: jobCandidate.notes,
        }));

        setBoard({
          SOURCED: candidates.filter((candidate) => candidate.status === 'SOURCED'),
          CONTACTED: candidates.filter((candidate) => candidate.status === 'CONTACTED'),
          INTERVIEWING: candidates.filter((candidate) => candidate.status === 'INTERVIEWING'),
          SHORTLISTED: candidates.filter((candidate) => candidate.status === 'SHORTLISTED'),
          REJECTED: candidates.filter((candidate) => candidate.status === 'REJECTED'),
        });
      } catch (fetchError) {
        console.error(fetchError);
        setError('Unable to load pipeline. Please try again.');
      } finally {
        setLoadingBoard(false);
      }
    };

    void fetchPipeline();
  }, [selectedJobId]);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId), [jobs, selectedJobId]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
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
      await api.put(`/jobs/${selectedJobId}/candidates/${movingCandidate.id}/status`, {
        status: destinationStatus,
      });
    } catch (updateError) {
      console.error(updateError);
      setBoard(board);
    }
  };

  const renderCandidateCard = (candidate: PipelineCandidate, accent: string) => (
    <div
      key={candidate.id}
      className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-navy/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${accent}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-navy">{candidate.fullName}</p>
          <p className="text-xs text-navy/60">
            {candidate.experience?.[0]?.title || candidate.skills?.slice(0, 3).join(', ') || candidate.location || 'Details unavailable'}
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
          <p className="text-sm uppercase tracking-wide text-navy/50">Flow</p>
          <h1 className="font-display text-3xl font-bold text-navy">Pipeline</h1>
          <p className="mt-1 text-sm text-navy/60">Visualize candidate progress across every stage and keep momentum strong.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-navy" htmlFor="job-select">
            Job
          </label>
          <select
            id="job-select"
            value={selectedJobId}
            onChange={(event) => setSelectedJobId(event.target.value)}
            className="rounded-xl border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm outline-none transition focus:border-indigo-300"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
                {job.company ? ` · ${job.company}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>}

      {loadingJobs ? (
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
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-sm text-navy/70 shadow-sm ring-1 ring-navy/5">
          No jobs found. Create a job to start building your pipeline.
        </div>
      ) : (
        <div className="space-y-3">
          {selectedJob && (
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 px-4 py-3 text-sm text-navy/80 ring-1 ring-navy/5">
              Viewing pipeline for <span className="font-semibold text-navy">{selectedJob.title}</span>
              {selectedJob.company ? ` at ${selectedJob.company}` : ''}.
            </div>
          )}

          {loadingBoard ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(5)].map((_, index) => (
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
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {pipelineColumns.map((column) => (
                  <Droppable droppableId={column.key} key={column.key}>
                    {(provided: DroppableProvided) => (
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
                                ? 'No candidates yet. Attach candidates to this job to begin.'
                                : 'Drag candidates here to move them into this stage.'}
                            </div>
                          )}
                          {board[column.key].map((candidate, index) => (
                            <Draggable draggableId={`${candidate.id}-${column.key}`} index={index} key={`${candidate.id}-${column.key}`}>
                              {(draggableProvided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
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
      )}
    </div>
  );
};

export default PipelinePage;
