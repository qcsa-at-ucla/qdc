'use client';

import { useEffect, useMemo, useState } from 'react';
import QDW2026Nav from '@/components/QDW2026Nav';
import QDWPosterGallery, { type PosterEntry } from '@/components/QDWPosterGallery';

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
          cache: 'no-store',
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
        <div className="p-2 sm:p-4">
          <h1 className="text-3xl sm:text-4xl font-black mb-4 text-left">QDW 2026 Student Poster Section</h1>
          <p className="text-white/80 max-w-3xl text-left">
            Explore paid student poster submissions from QDW 2026 (in-person and online). You can search by name, title, research topic, lab, or location.
          </p>
          <p className="text-white/70 max-w-3xl mt-3 text-left">
            When our Poster Sessions are taking place during QDW, we'll open up a Zoom room for members to drop by and talk with Poster authors and attendees.
          </p>
          <p className="text-white/70 max-w-3xl mt-3 text-left">
            We will open up voting for posters when the Poster Session starts on June 15. Vote for your favourite poster! We will announce winners at the end of the workshop.
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
            placeholder="Search by student name, project title, topic, or location"
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

        {!loading && !error && (
          <div className="mt-10">
            <QDWPosterGallery posters={filteredPosters} />
          </div>
        )}
      </section>
    </main>
  );
}
