"use client";

import { useState, useEffect } from "react";

interface ManualJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  link: string;
  is_active: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  title: "",
  company: "",
  location: "",
  type: "Full-Time",
  description: "",
  link: "",
};

export default function ManageJobsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [jobs, setJobs] = useState<ManualJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_api_key");
    if (stored) {
      setApiKey(stored);
      loadJobs(stored);
    }
  }, []);

  const loadJobs = async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, action: "list" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load jobs");
      setJobs(data.jobs || []);
      setAuthenticated(true);
      sessionStorage.setItem("admin_api_key", key);
    } catch (err: any) {
      setAuthError(err.message);
      setAuthenticated(false);
      sessionStorage.removeItem("admin_api_key");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs(apiKey);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/jobs/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, action: "add", job: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add job");
      setJobs([data.job, ...jobs]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccess("Job listing added successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    setActionLoading(id + "-toggle");
    try {
      const res = await fetch("/api/jobs/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, action: "toggle", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobs(jobs.map((j) => (j.id === id ? data.job : j)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this job listing?")) return;
    setActionLoading(id + "-delete");
    try {
      const res = await fetch("/api/jobs/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, action: "delete", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobs(jobs.filter((j) => j.id !== id));
      setSuccess("Job listing deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Manage Job Listings</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Admin access required</p>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter API key"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Authenticated ──────────────────────────────────────────────────────────
  const activeCount = jobs.filter((j) => j.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
            <p className="text-gray-500 text-sm mt-1">
              {activeCount} active · {jobs.length} total: active listings appear pinned at the top of the jobs page
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(!showForm); setFormError(""); setForm(EMPTY_FORM); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              {showForm ? "Cancel" : "+ Add Listing"}
            </button>
            <button
              onClick={() => {
                setAuthenticated(false);
                sessionStorage.removeItem("admin_api_key");
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Global feedback */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">New Job Listing</h2>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Quantum Hardware Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Google Quantum AI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Santa Barbara, CA (Remote)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                    <option>Postdoc</option>
                    <option>PhD Position</option>
                    <option>Research Fellowship</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  maxLength={600}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief role description..."
                />
                <p className="text-xs text-gray-400 text-right">{form.description.length}/600</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Link (URL) *</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition"
                >
                  {formLoading ? "Saving…" : "Add Listing"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(""); setForm(EMPTY_FORM); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Job list */}
        {loading ? (
          <div className="text-gray-500 text-center py-12">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-400">
            No manual listings yet. Click <strong>+ Add Listing</strong> to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition ${
                  job.is_active ? "border-gray-200" : "border-gray-100 opacity-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          job.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {job.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-indigo-600 text-sm font-medium">{job.company}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {job.location} · {job.type}
                    </p>
                    <p className="text-gray-700 text-sm mt-2 line-clamp-2">{job.description}</p>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-600 text-xs mt-1 inline-block truncate max-w-xs"
                    >
                      {job.link}
                    </a>
                  </div>

                  <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
                    <button
                      onClick={() => handleToggle(job.id)}
                      disabled={actionLoading === job.id + "-toggle"}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      {actionLoading === job.id + "-toggle"
                        ? "…"
                        : job.is_active
                        ? "Hide"
                        : "Show"}
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={actionLoading === job.id + "-delete"}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      {actionLoading === job.id + "-delete" ? "…" : "Delete"}
                    </button>
                    <p className="text-gray-300 text-xs hidden sm:block text-right">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
