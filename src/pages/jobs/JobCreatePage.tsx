import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const JobCreatePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [seniority, setSeniority] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const templateContent = useMemo(
    () =>
      [
        'HireFlow Job Import Template',
        'Fill in the details after each label and upload the file back to HireFlow.',
        '',
        'Title: ',
        'Company: ',
        'Location: ',
        'Seniority: ',
        'Salary Min: ',
        'Salary Max: ',
        'Required Skills: (comma separated)',
        'Description:',
        'Paste the job description here. You can keep multiple lines.',
      ].join('\n'),
    [],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/jobs', {
        title,
        company,
        location,
        seniority,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        description,
        requiredSkills: requiredSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      navigate('/app/jobs');
    } catch (submitError) {
      console.error(submitError);
      setError('Could not create the job right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateJd = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setError(null);

    try {
      const response = await api.post<{ text: string }>('/ai/generate-jd', { prompt: aiPrompt });
      setAiGeneratedText(response.data?.text || '');
    } catch (aiError) {
      console.error(aiError);
      setAiGeneratedText('Unable to generate a description right now. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUseGeneratedJd = () => {
    if (!aiGeneratedText.trim()) return;
    setDescription(aiGeneratedText);
    setAiModalOpen(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([templateContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hireflow-job-template.doc';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseJobDoc = (content: string) => {
    const extractField = (label: string) => {
      const match = new RegExp(`${label}:\\s*(.*)`, 'i').exec(content);
      return match?.[1]?.trim() || '';
    };

    const parsedTitle = extractField('Title');
    const parsedCompany = extractField('Company');
    const parsedLocation = extractField('Location');
    const parsedSeniority = extractField('Seniority');
    const parsedSalaryMin = extractField('Salary Min');
    const parsedSalaryMax = extractField('Salary Max');
    const skillsLine = extractField('Required Skills');

    const descriptionMatch = /Description:\s*([\s\S]*)/i.exec(content);
    const parsedDescription = descriptionMatch?.[1]?.trim() || '';

    setTitle((previous) => parsedTitle || previous);
    setCompany((previous) => parsedCompany || previous);
    setLocation((previous) => parsedLocation || previous);
    setSeniority((previous) => parsedSeniority || previous);
    setSalaryMin((previous) => parsedSalaryMin || previous);
    setSalaryMax((previous) => parsedSalaryMax || previous);
    setRequiredSkills((previous) => skillsLine || previous);
    setDescription((previous) => parsedDescription || previous);
  };

  const handleJobDocUpload = async (file: File) => {
    setImporting(true);
    setImportError(null);

    try {
      const content = await file.text();
      parseJobDoc(content);
      setImportModalOpen(false);
    } catch (uploadError) {
      console.error(uploadError);
      setImportError('Unable to read that file. Please try again with the template.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-navy/50">Create</p>
          <h1 className="font-display text-3xl font-bold text-navy">New Job</h1>
          <p className="mt-1 text-sm text-navy/60">Define the essentials for this role to keep hiring aligned.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setImportError(null);
              setImportModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            📄 Import from Job File
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600"
          >
            Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Job title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="Product Manager"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Company</label>
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              required
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="HireFlow"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Location</label>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="Remote / San Francisco"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Seniority</label>
            <input
              type="text"
              value={seniority}
              onChange={(event) => setSeniority(event.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="Senior"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Salary range (min)</label>
            <input
              type="number"
              value={salaryMin}
              onChange={(event) => setSalaryMin(event.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="90000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy">Salary range (max)</label>
            <input
              type="number"
              value={salaryMax}
              onChange={(event) => setSalaryMax(event.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
              placeholder="140000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-navy">Description</label>
          <div className="flex flex-wrap items-center gap-2 text-xs text-navy/60">
            <span>Need inspiration?</span>
            <button
              type="button"
              onClick={() => {
                setAiPrompt(
                  [title && `Role: ${title}`, company && `Company: ${company}`, location && `Location: ${location}`]
                    .filter(Boolean)
                    .join('. '),
                );
                setAiGeneratedText(description);
                setAiModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-600 ring-1 ring-indigo/10 transition hover:-translate-y-0.5 hover:bg-indigo-100"
            >
              ✨ Generate JD with AI
            </button>
          </div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
            placeholder="Outline responsibilities, expectations, and team context."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-navy">Required skills</label>
          <input
            type="text"
            value={requiredSkills}
            onChange={(event) => setRequiredSkills(event.target.value)}
            className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300 focus:shadow-md"
            placeholder="e.g. React, TypeScript, Product discovery"
          />
          <p className="text-xs text-navy/50">Separate each skill with a comma.</p>
        </div>

        {error ? (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{error}</div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/jobs')}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-navy transition hover:text-indigo-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Creating...' : 'Create job'}
          </button>
        </div>
      </form>

      {aiModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-navy/60 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-navy">Generate JD with AI</h3>
                <p className="text-sm text-navy/60">Share a short brief and let AI draft the description.</p>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="rounded-full p-2 text-sm font-semibold text-navy/60 transition hover:bg-slate-100 hover:text-navy"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-navy" htmlFor="ai-prompt">
                  Describe the role (location, seniority, key skills)
                </label>
                <textarea
                  id="ai-prompt"
                  className="min-h-[120px] w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300"
                  placeholder="Senior React dev for SaaS, 5+ years, remote, US/EU timezone."
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                />
                <p className="text-xs text-navy/50">The richer the prompt, the more tailored the JD.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-navy" htmlFor="ai-output">
                  AI suggestion
                </label>
                <textarea
                  id="ai-output"
                  className="min-h-[180px] w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-inner outline-none transition focus:border-indigo-300"
                  placeholder="Generated job description will appear here."
                  value={aiGeneratedText}
                  onChange={(event) => setAiGeneratedText(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-navy/70">
                  {aiGenerating ? 'Generating a description...' : 'Use AI to save time; you can still edit anything.'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateJd}
                    disabled={aiGenerating || !aiPrompt.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {aiGenerating && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden />
                    )}
                    Generate
                  </button>
                  <button
                    type="button"
                    onClick={handleUseGeneratedJd}
                    disabled={!aiGeneratedText.trim()}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition enabled:hover:-translate-y-0.5 enabled:hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Use this
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {importModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-navy/60 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-navy">Import job from a doc file</h3>
                <p className="text-sm text-navy/60">Download the template, fill it out, and upload to pre-fill this form.</p>
              </div>
              <button
                type="button"
                onClick={() => (!importing ? setImportModalOpen(false) : null)}
                className="rounded-full p-2 text-sm font-semibold text-navy/60 transition hover:bg-slate-100 hover:text-navy"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-navy/80 ring-1 ring-indigo-100">
                Start with the template so our parser can map details to the right fields.
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  ↓ Download template
                </button>
                <label
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700"
                >
                  {importing ? 'Reading file…' : 'Upload completed doc'}
                  <input
                    type="file"
                    accept=".doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleJobDocUpload(file);
                    }}
                  />
                </label>
              </div>

              <p className="text-xs text-navy/50">
                We fill in any fields you leave blank with your current entries so you can review everything before creating the job.
              </p>

              {importError ? (
                <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">{importError}</div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCreatePage;
