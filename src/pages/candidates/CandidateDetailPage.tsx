import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';

const skillStyles = [
  'bg-indigo-50 text-indigo-700 ring-indigo-100',
  'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'bg-amber-50 text-amber-700 ring-amber-100',
  'bg-sky-50 text-sky-700 ring-sky-100',
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-purple-50 text-purple-700 ring-purple-100',
];

const formatDateRange = (start?: string, end?: string) => {
  const format = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  const startText = format(start);
  const endText = end ? format(end) : 'Present';

  if (!startText && !endText) return '';
  if (startText && !endText) return startText;
  return `${startText || ''} — ${endText}`.trim();
};

type Experience = {
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
};

type CandidateDetail = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  skills?: string[];
  summary?: string;
  experience?: Experience[];
  rawText?: string;
};

type Job = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  description?: string;
};

type AiScore = {
  score: number;
  explanation?: string;
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 w-1/2 rounded bg-navy/10" />
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-48 rounded-2xl bg-navy/5" />
        <div className="h-64 rounded-2xl bg-navy/5" />
      </div>
      <div className="space-y-4">
        <div className="h-48 rounded-2xl bg-navy/5" />
        <div className="h-64 rounded-2xl bg-navy/5" />
      </div>
    </div>
  </div>
);

const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scoring, setScoring] = useState(false);
  const [aiScore, setAiScore] = useState<AiScore | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachText, setOutreachText] = useState('');

  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [candidateResponse, jobsResponse] = await Promise.all([
          api.get<CandidateDetail>(`/candidates/${id}`),
          api.get<Job[]>('/jobs'),
        ]);

        setCandidate(candidateResponse.data || null);
        setJobs(jobsResponse.data || []);
        const firstJobId = (jobsResponse.data || [])[0]?.id;
        setSelectedJobId(firstJobId || '');
      } catch (fetchError) {
        console.error(fetchError);
        setError('Unable to load candidate details right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id]);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId), [jobs, selectedJobId]);

  const primaryRole = useMemo(() => {
    if (candidate?.summary) {
      const sentence = candidate.summary.split('.').filter(Boolean)[0];
      if (sentence) return sentence;
    }
    if (candidate?.skills?.length) {
      return candidate.skills[0];
    }
    return 'Candidate';
  }, [candidate]);

  const handleScoreCandidate = async () => {
    if (!candidate?.rawText || !selectedJob?.description) {
      setScoreError('Select a job with a description and ensure candidate resume text is available.');
      return;
    }

    setScoring(true);
    setScoreError(null);
    setAiScore(null);

    try {
      const response = await api.post<AiScore>('/ai/score-candidate', {
        jobDescription: selectedJob.description,
        candidateText: candidate.rawText,
      });
      setAiScore(response.data || null);
    } catch (scoreErr) {
      console.error(scoreErr);
      setScoreError('We could not score this candidate right now. Please try again.');
    } finally {
      setScoring(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!candidate || !selectedJob) return;
    setOutreachOpen(true);
    setOutreachLoading(true);
    setOutreachText('');

    try {
      const response = await api.post<{ text: string }>('/ai/generate-outreach', {
        job: selectedJob,
        candidate,
      });
      setOutreachText(response.data?.text || '');
    } catch (aiError) {
      console.error(aiError);
      setOutreachText('Unable to generate outreach right now. Please try again.');
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!candidate || !selectedJob) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryText('');

    try {
      const response = await api.post<{ text: string }>('/ai/generate-summary', {
        job: selectedJob,
        candidate,
      });
      setSummaryText(response.data?.text || '');
    } catch (aiError) {
      console.error(aiError);
      setSummaryError('Unable to generate summary right now. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    void navigator.clipboard.writeText(text);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-2xl bg-rose-50 p-6 text-rose-700 ring-1 ring-rose-100">
        <h2 className="font-display text-2xl font-semibold">Something went wrong</h2>
        <p>{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-navy/50">Candidate profile</p>
        <h1 className="font-display text-4xl font-bold text-navy">{candidate.fullName}</h1>
        <p className="text-lg text-navy/70">{primaryRole}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-navy/50">Location</p>
                <p className="text-base font-semibold text-navy">{candidate.location || 'Unknown'}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-navy/70">
                {candidate.email && <span className="rounded-full bg-navy/5 px-3 py-1">{candidate.email}</span>}
                {candidate.phone && <span className="rounded-full bg-navy/5 px-3 py-1">{candidate.phone}</span>}
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 ring-1 ring-indigo/10"
                  >
                    LinkedIn
                    <span aria-hidden>↗</span>
                  </a>
                )}
                {candidate.github && (
                  <a
                    href={candidate.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700"
                  >
                    GitHub
                    <span aria-hidden>↗</span>
                  </a>
                )}
                {candidate.website && (
                  <a
                    href={candidate.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-emerald/10"
                  >
                    Website
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-sm uppercase tracking-wide text-navy/50">Summary</p>
              <p className="text-base leading-relaxed text-navy/80">{candidate.summary || 'No summary available.'}</p>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm uppercase tracking-wide text-navy/50">Skills</p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills?.length ? (
                  candidate.skills.map((skill, index) => (
                    <span
                      key={skill}
                      className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${skillStyles[index % skillStyles.length]}`}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-navy/50">No skills listed.</span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-navy">Experience</h2>
              {candidate.experience?.length ? (
                <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy/60">
                  {candidate.experience.length} roles
                </span>
              ) : null}
            </div>

            <div className="mt-4 space-y-4">
              {candidate.experience?.length ? (
                candidate.experience.map((item, index) => (
                  <div key={`${item.company}-${index}`} className="rounded-xl border border-navy/5 bg-navy/2 p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-navy">{item.title || 'Role'}</p>
                        <p className="text-sm text-navy/60">{item.company || 'Company'}</p>
                      </div>
                      <div className="text-right text-sm text-navy/50">
                        <p>{formatDateRange(item.startDate, item.endDate)}</p>
                        {item.location && <p>{item.location}</p>}
                      </div>
                    </div>
                    {item.description && <p className="mt-2 text-sm leading-relaxed text-navy/80">{item.description}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-navy/60">No experience details available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
            <h2 className="font-display text-xl font-semibold text-navy">AI Insights</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-navy">Select Job to Match</label>
                <select
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-navy shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} {job.company ? `• ${job.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleScoreCandidate}
                  disabled={scoring || !selectedJobId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {scoring ? 'Scoring...' : 'Score fit with AI'}
                </button>
                {scoreError && <p className="text-sm text-rose-600">{scoreError}</p>}
                {aiScore && (
                  <div className="mt-3 rounded-xl border border-indigo/10 bg-indigo-50 p-4 text-indigo-800">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-white text-center text-xl font-bold leading-[64px] text-indigo-600 shadow-inner">
                        {Math.round(aiScore.score)}%
                      </div>
                      <div className="flex-1 text-sm text-indigo-900">
                        <p className="font-semibold">Fit score</p>
                        <p className="mt-1 text-indigo-900/80">{aiScore.explanation || 'AI analysis provided the score above.'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGenerateOutreach}
                  disabled={!selectedJobId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Generate outreach message
                </button>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={!selectedJobId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Generate client summary
                </button>
                {summaryError && <p className="text-sm text-rose-600">{summaryError}</p>}
              </div>

              {summaryLoading && <p className="text-sm text-navy/60">Generating summary...</p>}
              {summaryText && !summaryLoading && (
                <div className="mt-2 space-y-2 rounded-xl border border-slate/10 bg-slate-50 p-4 text-sm text-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">AI Client Summary</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(summaryText)}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{summaryText}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-navy">Matching Jobs</h2>
              <button
                type="button"
                className="text-sm font-semibold text-indigo-600 hover:underline"
                onClick={() => navigate('/app/jobs')}
              >
                View all
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {jobs.length ? (
                jobs.map((job) => (
                  <div key={job.id} className="rounded-xl border border-navy/5 bg-navy/2 p-4 text-sm shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-navy">{job.title}</p>
                        <p className="text-navy/60">{job.company || 'Company not specified'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/app/jobs/${job.id}`)}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Open
                      </button>
                    </div>
                    <p className="mt-2 leading-relaxed text-navy/70">{job.description || 'No description available.'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-navy/60">No jobs available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {outreachOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-navy/50">AI Outreach</p>
                <h3 className="font-display text-2xl font-semibold text-navy">Personalized message</h3>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-navy/50 hover:bg-navy/5"
                onClick={() => setOutreachOpen(false)}
              >
                <span className="text-lg" aria-hidden>
                  ×
                </span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {outreachLoading ? (
                <p className="text-sm text-navy/60">Generating outreach message...</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy">AI generated text</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(outreachText)}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="rounded-xl bg-navy/2 p-4 text-sm leading-relaxed text-navy/90 ring-1 ring-navy/5">
                    {outreachText || 'No message generated yet.'}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setOutreachOpen(false)}
                className="rounded-xl bg-navy/5 px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetailPage;
