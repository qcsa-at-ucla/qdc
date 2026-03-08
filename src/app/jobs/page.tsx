'use client';

import { useEffect, useState } from "react";

type Job = {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  link: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async (regenerate = false) => {
    try {
      regenerate ? setRefreshing(true) : setLoading(true);

      const url = regenerate ? "/api/jobs?regenerate=true" : "/api/jobs";
      const res = await fetch(url);
      const data = await res.json();

      const newJobs = (data.jobs || []).slice(0, 7);

      setJobs(newJobs);
      setFilteredJobs(newJobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.type.toLowerCase().includes(q)
    );

    setFilteredJobs(filtered);
  }, [searchQuery, jobs]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 space-y-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h1 className="text-4xl font-bold">
              Quantum Device Job Opportunities
            </h1>
            <p className="text-gray-700 text-lg max-w-3xl">
              Explore career opportunities in quantum hardware, software,
              superconducting circuits, simulation, and related technologies.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Powered by AI Search
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search jobs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-w-0"
            />

            <button
              onClick={() => loadJobs(true)}
              disabled={refreshing}
              className="flex-none w-40 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {refreshing ? "Regenerating…" : "Regenerate Jobs"}
            </button>
          </div>
        </div>

        {(loading || refreshing) && (
          <div className="text-gray-500 text-lg">Loading jobs…</div>
        )}

        <div className="space-y-6">
          {filteredJobs.map((job, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition"
            >
              <div className="flex flex-col md:flex-row justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <p className="text-indigo-600 font-medium">{job.company}</p>
                  <p className="text-gray-500 text-sm">
                    {job.location} — {job.type}
                  </p>
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

              <p className="mt-3 text-gray-700 text-sm">
                {job.description}
              </p>
            </div>
          ))}

          {!loading && filteredJobs.length === 0 && (
            <div className="text-gray-500 text-center text-lg">
              No jobs found — try a different search.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}