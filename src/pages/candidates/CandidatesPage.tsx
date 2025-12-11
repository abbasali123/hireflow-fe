import { type ChangeEvent, type DragEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { type ApiError } from '../../api/client';

export type Candidate = {
  id: string;
  fullName: string;
  email: string;
  location: string;
  skills: string[];
  createdAt: string;
  matchScore?: number;
};

const skillColors = [
  'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  'bg-purple-50 text-purple-700 ring-1 ring-purple-100',
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const CandidatesPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    void fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Candidate[]>('/candidates');
      setCandidates(response.data || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError('Unable to load candidates right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return candidates;

    return candidates.filter((candidate) => {
      const combinedSkills = candidate.skills.join(' ').toLowerCase();
      return (
        candidate.fullName.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.location.toLowerCase().includes(query) ||
        combinedSkills.includes(query)
      );
    });
  }, [candidates, searchTerm]);

  const handleRowClick = (candidateId: string) => {
    navigate(`/app/candidates/${candidateId}`);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setUploadError(null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    setSelectedFile(file || null);
    setUploadError(null);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please choose a resume file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      await api.post<Candidate>('/candidates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          } else {
            setUploadProgress(null);
          }
        },
      });

      setModalOpen(false);
      setSelectedFile(null);
      setUploadProgress(null);
      void fetchCandidates();
    } catch (uploadErr) {
      console.error(uploadErr);
      const axiosError = uploadErr as ApiError<{ message?: string }>;
      const message = axiosError.response?.data?.message || axiosError.message || 'Upload failed. Please try again.';
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const renderMatchScore = (matchScore?: number) => {
    if (matchScore === undefined || matchScore === null) return <span className="text-xs text-navy/50">—</span>;
    const score = Math.min(Math.max(matchScore, 0), 100);
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-navy/10">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${score}%` }} />
        </div>
        <span className="text-xs font-semibold text-navy/70">{score}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 p-4 text-sm text-navy/80 ring-1 ring-navy/5">
        <span className="mr-2 rounded-full bg-white/60 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-navy/70 ring-1 ring-navy/10">
          Tip
        </span>
        Upload multiple resumes to let HireFlow AI discover your best matches.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-navy/50">Talent pool</p>
          <h1 className="font-display text-3xl font-bold text-navy">Candidates</h1>
          <p className="mt-1 text-sm text-navy/60">Browse every lead, see skills at a glance, and jump into profiles instantly.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload Resume
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by name or skill"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-3 top-3 h-5 w-5 text-navy/40"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a7 7 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 9a5 5 0 11-10 0 5 5 0 0110 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="text-sm text-navy/60">{filteredCandidates.length} candidates shown</div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
        <div className="grid grid-cols-12 bg-navy/5 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-navy/60">
          <div className="col-span-4">Candidate</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-3">Skills</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-1 text-right">Match</div>
        </div>
        <div className="divide-y divide-navy/5">
          {loading && (
            <div className="flex items-center justify-center p-6 text-sm text-navy/60">Loading candidates...</div>
          )}
          {error && (
            <div className="p-6 text-sm text-rose-600">
              {error}
              <button type="button" onClick={() => void fetchCandidates()} className="ml-3 text-indigo-600 underline">
                Retry
              </button>
            </div>
          )}
          {!loading && !error && filteredCandidates.length === 0 && (
            <div className="p-6 text-sm text-navy/60">No candidates match this search yet.</div>
          )}
          {!loading &&
            !error &&
            filteredCandidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => handleRowClick(candidate.id)}
                className="grid w-full grid-cols-12 items-center gap-3 px-6 py-4 text-left transition hover:bg-indigo-50"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {candidate.fullName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-navy">{candidate.fullName}</div>
                    <div className="flex items-center gap-3 text-xs text-navy/60">
                      <span className="inline-flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 0c-4.418 0-8 2.239-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.761-3.582-5-8-5z"
                          />
                        </svg>
                        {candidate.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-sm text-navy/70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z"
                    />
                  </svg>
                  {candidate.location}
                </div>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {candidate.skills.slice(0, 4).map((skill, index) => (
                    <span
                      key={`${candidate.id}-${skill}`}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${skillColors[index % skillColors.length]}`}
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 4 && (
                    <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy/70">+{candidate.skills.length - 4} more</span>
                  )}
                </div>
                <div className="col-span-2 text-sm text-navy/70">{formatDate(candidate.createdAt)}</div>
                <div className="col-span-1 flex justify-end">{renderMatchScore(candidate.matchScore)}</div>
              </button>
            ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-navy/10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy">Upload Resume</h2>
                <p className="mt-1 text-sm text-navy/60">Drop a resume or choose a file to add a new candidate.</p>
              </div>
              <button
                type="button"
                onClick={() => (!uploading ? setModalOpen(false) : null)}
                className="rounded-lg p-2 text-navy/60 transition hover:bg-navy/5"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label
              htmlFor="resume-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 px-6 py-10 text-center text-navy/70 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 16V4m0 0l-4 4m4-4l4 4M6 16h12m-2 4H8a2 2 0 01-2-2v-2" />
              </svg>
              <p className="mt-3 text-sm font-semibold text-navy">Drag & drop resume</p>
              <p className="text-xs text-navy/60">PDF, DOC, or DOCX</p>
              <input
                id="resume-upload"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile && <p className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">{selectedFile.name}</p>}
            </label>

            {uploadError && <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{uploadError}</div>}

            {uploadProgress !== null && uploading && (
              <div className="mt-3 flex items-center gap-3 text-sm text-navy/70">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy/10">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs font-semibold text-navy/70">{uploadProgress}%</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => (!uploading ? setModalOpen(false) : null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-navy/70 transition hover:bg-navy/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleUpload()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uploading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
