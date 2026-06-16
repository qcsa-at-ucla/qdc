"use client";

import { useEffect, useMemo, useState } from "react";
import QDW2026Nav from "@/components/QDW2026Nav";

type SponsorAttendee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationType: string;
  designation: string;
  location: string;
  dietaryRestriction: string;
  projectTitle: string;
  projectDescription: string;
  hasCv: boolean;
  hasPoster: boolean;
  createdAt: string;
};

function registrationLabel(type: string): string {
  switch (type) {
    case "student_in_person":
      return "Student (In Person)";
    case "student_online":
      return "Student (Online)";
    case "professional_in_person":
      return "Professional (In Person)";
    case "professional_online":
      return "Professional (Online)";
    default:
      return type ? type.replace(/_/g, " ") : "-";
  }
}

export default function QDW2026SponsorPage() {
  const [passcode, setPasscode] = useState("");
  const [storedPasscode, setStoredPasscode] = useState("");
  const [attendees, setAttendees] = useState<SponsorAttendee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendees = async (code: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/qdw/sponsor-attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code }),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load attendees");
      }

      setAttendees(data.attendees || []);
      setStoredPasscode(code);
      sessionStorage.setItem("qdw_sponsor_passcode", code);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load attendees";
      setError(message);
      setAttendees([]);
      setStoredPasscode("");
      sessionStorage.removeItem("qdw_sponsor_passcode");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("qdw_sponsor_passcode");
    if (saved) {
      setPasscode(saved);
      fetchAttendees(saved);
    }
  }, []);

  const filteredAttendees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return attendees;

    return attendees.filter((attendee) => {
      const name = `${attendee.firstName} ${attendee.lastName}`.toLowerCase();
      return (
        name.includes(query) ||
        attendee.email.toLowerCase().includes(query) ||
        attendee.registrationType.toLowerCase().includes(query) ||
        attendee.designation.toLowerCase().includes(query) ||
        attendee.location.toLowerCase().includes(query) ||
        attendee.projectTitle.toLowerCase().includes(query)
      );
    });
  }, [attendees, searchTerm]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchAttendees(passcode.trim());
  };

  const handleLogout = () => {
    setStoredPasscode("");
    setPasscode("");
    setAttendees([]);
    setSearchTerm("");
    setError("");
    sessionStorage.removeItem("qdw_sponsor_passcode");
  };

  return (
    <main className="min-h-screen bg-black text-white pt-20 pb-20">
      <QDW2026Nav />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!storedPasscode ? (
          <div className="mx-auto max-w-md rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-950/45 via-black to-blue-950/25 p-8 shadow-2xl shadow-purple-950/20">
            <h1 className="text-3xl font-black">Sponsor Access</h1>
            <p className="mt-3 text-sm text-white/70">
              Enter the QDW 2026 sponsor passcode to view paid attendees, CVs, and posters.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="sponsor-passcode" className="block text-sm font-semibold text-white/80 mb-2">
                  Passcode
                </label>
                <input
                  id="sponsor-passcode"
                  type="password"
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter sponsor passcode"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {loading ? "Checking..." : "View Sponsor Table"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 via-black to-blue-950/30 p-8 sm:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black">QDW 2026 Sponsor Attendees</h1>
                  <p className="mt-3 max-w-3xl text-white/75">
                    Paid attendee list with CV and poster links for sponsor review.
                  </p>
                  <p className="mt-3 text-sm text-white/60">
                    {attendees.length} paid attendees · {attendees.filter((a) => a.hasCv).length} with CV · {attendees.filter((a) => a.hasPoster).length} with poster
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => fetchAttendees(storedPasscode)}
                    disabled={loading}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                  >
                    Lock
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200">
                {error}
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <label htmlFor="sponsor-search" className="block text-sm font-semibold text-white/80 mb-2">
                Search Attendees
              </label>
              <input
                id="sponsor-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, email, type, designation, location, or project"
                className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] shadow-2xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 bg-white/10">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">#</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">Name</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">Email</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">Type</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">Designation</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">Location</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">Dietary</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">Project</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white/70">Registered</th>
                      <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-white/70">CV</th>
                      <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-white/70">Poster</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredAttendees.map((attendee, index) => (
                      <tr key={attendee.id} className="transition hover:bg-white/[0.06]">
                        <td className="px-4 py-3 text-xs text-white/35">{index + 1}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-white">
                          {attendee.firstName} {attendee.lastName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-white/70">
                          <a href={`mailto:${attendee.email}`} className="transition hover:text-purple-200">
                            {attendee.email}
                          </a>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/15 px-2.5 py-1 text-xs font-semibold text-purple-100">
                            {registrationLabel(attendee.registrationType)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-white/70">{attendee.designation || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-white/70">{attendee.location || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-white/70">{attendee.dietaryRestriction || "-"}</td>
                        <td className="max-w-[220px] px-4 py-3 text-white/80">
                          {attendee.projectTitle ? (
                            <span title={attendee.projectTitle} className="block truncate">
                              {attendee.projectTitle}
                            </span>
                          ) : (
                            <span className="text-white/35">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-white/55">
                          {attendee.createdAt ? new Date(attendee.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attendee.hasCv ? (
                            <a
                              href={`/api/qdw/view-cv?email=${encodeURIComponent(attendee.email)}&t=${Date.now()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex rounded-full bg-purple-500/15 px-3 py-1.5 text-xs font-bold text-purple-100 transition hover:bg-purple-500/25"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-xs text-white/25">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attendee.hasPoster ? (
                            <a
                              href={`/api/qdw/view-poster?email=${encodeURIComponent(attendee.email)}&t=${Date.now()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex rounded-full bg-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-100 transition hover:bg-indigo-500/25"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-xs text-white/25">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAttendees.length === 0 && !loading && (
                <div className="px-6 py-10 text-center text-white/55">
                  No paid attendees match this search.
                </div>
              )}

              <div className="border-t border-white/10 px-4 py-3 text-xs text-white/40">
                Showing {filteredAttendees.length} of {attendees.length} paid attendees
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
