'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import QDW2026Nav from '@/components/QDW2026Nav';

interface PosterEntry {
  id: string;
  name: string;
  designation: string;
  location: string;
  registrationType: string;
  projectTitle: string;
  projectDescription: string;
  hasPoster?: boolean;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatRegistrationType(type: string): string {
  if (type === 'student_in_person') return 'Student (In Person)';
  if (type === 'student_online') return 'Student (Online)';
  if (type === 'professional_in_person') return 'Professional (In Person)';
  if (type === 'professional_online') return 'Professional (Online)';
  return 'Student';
}

export default function QDW2026PostersPage() {
  const [posters, setPosters] = useState<PosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchPosters = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/qdw/posters', {
          method: 'GET',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load posters');
        }

        if (mounted) {
          setPosters(data.posters || []);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load posters';
        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPosters();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredPosters = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return posters;

    return posters.filter((entry) => {
      return (
        entry.name.toLowerCase().includes(normalized) ||
        entry.projectTitle.toLowerCase().includes(normalized) ||
        entry.projectDescription.toLowerCase().includes(normalized) ||
        entry.designation.toLowerCase().includes(normalized) ||
        entry.location.toLowerCase().includes(normalized)
      );
    });
  }, [posters, searchTerm]);

  return (
    <main className="min-h-screen bg-black text-white pt-20 pb-20">
      <QDW2026Nav />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30 p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-4 text-left">QDW 2026 Student/Professional Poster Section</h1>
          <p className="text-white/80 max-w-3xl text-left">
            Explore student and professional poster submissions from QDW 2026 (in-person and online). You can search by name, title, research topic, lab, or location.
          </p>
          <p className="text-white/70 max-w-3xl mt-3">
            When our Poster Sessions are taking place during QDW, we'll open up a Zoom room for members to drop by and talk with Poster authors and attendees.
          </p>
          <p className="text-white/70 max-w-3xl mt-3 text-left">
            We will open up voting for posters when the Poster Session starts on June 15. Vote for your favourite poster through your member portal! We will announce winners at the end of the workshop.
          </p>

        </div>

        <div className="mt-8">
          <label htmlFor="poster-search" className="block text-sm font-semibold text-white/80 mb-2">
            Search Posters
          </label>
          <input
            id="poster-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, project title, topic, or location"
            className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {loading && (
          <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-6 text-white/70">
            Loading poster section...
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && filteredPosters.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
            <p className="text-white/70">No posters found for this search.</p>
          </div>
        )}

        {!loading && !error && filteredPosters.length > 0 && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosters.map((entry) => (
              <article
                key={entry.id}
                className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
                    {formatRegistrationType(entry.registrationType)}
                  </span>
                  {entry.approvedAt && (
                    <span className="text-xs text-white/50">
                      Approved {new Date(entry.approvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-xl font-bold text-white leading-tight">{entry.projectTitle}</h2>

                <p className="mt-3 text-sm text-white/75 line-clamp-5 min-h-[7.5rem]">
                  {entry.projectDescription || 'No description provided.'}
                </p>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{entry.name}</p>
                    {entry.designation && <p className="text-xs text-white/70">{entry.designation}</p>}
                    {entry.location && <p className="text-xs text-white/60">{entry.location}</p>}
                  </div>
                  <div className="w-32 h-20 shrink-0 rounded-lg border border-white/15 bg-black/40 overflow-hidden">
                    {entry.hasPoster && !['abhishek rakshit', 'richard ho', 'varun ramaprasad'].includes(entry.name.toLowerCase()) && (
                      <div className="flex h-full items-center justify-center text-purple-200">
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 3h7l5 5v13H7V3zm7 0v6h5M9 14h6M9 17h6M9 11h2" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  {!['abhishek rakshit', 'richard ho', 'varun ramaprasad'].includes(entry.name.toLowerCase()) && (
                    <Link
                      href={`/api/qdw/view-poster?id=${encodeURIComponent(entry.id)}&v=${encodeURIComponent(entry.updatedAt)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-purple-500 hover:bg-purple-600 transition-colors px-4 py-2 text-sm font-semibold text-white"
                    >
                      View Poster PDF
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
