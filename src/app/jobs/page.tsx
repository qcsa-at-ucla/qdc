'use client';

import { useEffect, useState } from "react";

type Category = 'all' | 'academic' | 'government' | 'industry';

type Job = {
  title: string;
  company: string;
  location: string;
  type: string;
  category: 'academic' | 'government' | 'industry';
  description: string;
  link: string;
  pinned?: boolean;
};

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "PhD Position", "Postdoc", "Other"];

const emptyForm = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  jobTitle: "",
  jobType: "Full-time",
  location: "",
  description: "",
  link: "",
};

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All Jobs',
  academic: 'Academic',
  government: 'Government',
  industry: 'Industry',
};

const CATEGORY_DESCRIPTIONS: Record<Exclude<Category, 'all'>, string> = {
  academic: 'University research, postdocs, PhD positions, and lab roles',
  government: 'National labs, defense agencies, and government-funded programs',
  industry: 'Private companies, startups, and corporate quantum teams',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Post a job
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadJobs = async (regenerate = false) => {
    try {
      regenerate ? setRefreshing(true) : setLoading(true);
      const url = regenerate ? "/api/jobs?regen=true" : "/api/jobs";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      const allJobs: Job[] = data.jobs || [];
      const pinned = allJobs.filter((j) => j.pinned);
      const ai = allJobs.filter((j) => !j.pinned);
      setJobs([...pinned, ...ai]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.type.toLowerCase().includes(q)
    );
    const matchesCategory = activeCategory === 'all' || job.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = {
    all: jobs.length,
    academic: jobs.filter(j => j.category === 'academic').length,
    government: jobs.filter(j => j.category === 'government').length,
    industry: jobs.filter(j => j.category === 'industry').length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/jobs/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true);
        setForm(emptyForm);
      } else {
        setSubmitError(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setSubmitError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h1 className="text-4xl font-bold">Quantum Job Opportunities</h1>
            <p className="text-gray-700 text-lg max-w-3xl">
              Explore career opportunities across academia, government labs, and industry
              in quantum computing, hardware, software, and related technologies.
            </p>
            <p className="text-gray-400 text-sm mt-1">Powered by AI Search</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search jobs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-0"
            />
            <button
              onClick={() => loadJobs(true)}
              disabled={refreshing}
              className="flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {refreshing ? "Regenerating…" : "Regenerate Jobs"}
            </button>
            <button
              onClick={() => { setShowForm(true); setSubmitSuccess(false); setSubmitError(""); }}
              className="flex-none bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap"
            >
              + Post a Job
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_LABELS[cat]}
              <span className={`ml-2 text-xs ${
                activeCategory === cat ? 'text-indigo-200' : 'text-gray-400'
              }`}>
                ({categoryCounts[cat]})
              </span>
            </button>
          ))}
        </div>

        {/* Category description */}
        {activeCategory !== 'all' && (
          <p className="text-gray-500 text-sm">
            {CATEGORY_DESCRIPTIONS[activeCategory]}
          </p>
        )}

        {/* Loading state */}
        {(loading || refreshing) && <div className="text-gray-500 text-lg">Loading jobs…</div>}

        {/* Job listings */}
        <div className="space-y-6">
          {filteredJobs.map((job, idx) => (
            <div
              key={idx}
              className={`border rounded-xl p-6 transition ${
                job.pinned
                  ? "bg-indigo-50 border-indigo-300 hover:bg-indigo-100"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.pinned && (
                      <span className="text-xs font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                    {job.category && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        job.category === 'academic'
                          ? 'bg-blue-100 text-blue-700'
                          : job.category === 'government'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-600 font-medium">{job.company}</p>
                  <p className="text-gray-500 text-sm">{job.location} — {job.type}</p>
                </div>
                {job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition self-start md:self-center w-36 text-center"
                  >
                    View Job &rarr;
                  </a>
                )}
              </div>
              <p className="mt-3 text-gray-700 text-sm">{job.description}</p>
            </div>
          ))}

          {!loading && !refreshing && filteredJobs.length === 0 && (
            <div className="text-gray-500 text-center text-lg">
              No jobs found — try a different search or category.
            </div>
          )}
        </div>

      </div>

      {/* Post a Job Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl" />

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Post a Job</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Submit your listing for admin review. Approved posts appear on this page within 1–2 business days.
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Thank you! Your listing will be reviewed and published within 3-5 business days.
                  </p>
                  <button
                    onClick={() => { setShowForm(false); setSubmitSuccess(false); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full px-6 py-2.5 transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Company info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                      <input
                        required
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Rigetti Computing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                      <input
                        required
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="you@company.com"
                    />
                  </div>

                  {/* Job info */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Job Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                        <input
                          required
                          value={form.jobTitle}
                          onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g. Quantum Hardware Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Type <span className="text-red-500">*</span></label>
                        <select
                          value={form.jobType}
                          onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                    <input
                      required
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Berkeley, CA / Remote"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Brief role description, responsibilities, qualifications…"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Link <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="url"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://careers.company.com/job/..."
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {submitError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full py-2.5 text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full py-2.5 text-sm transition"
                    >
                      {submitting ? "Submitting…" : "Submit for Review"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
