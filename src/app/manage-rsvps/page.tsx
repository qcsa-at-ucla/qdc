"use client";

import { useCallback, useEffect, useState } from "react";
import { Rsvp, toCsv } from "./csv";

const ATTENDANCE_LABELS: Record<string, string> = {
  day1: "Day 1 (Oct 22)",
  day2: "Day 2 (Oct 23)",
  both: "Both days",
  other: "Other",
};

export default function ManageRsvpsPage() {
  const [apiKey, setApiKey] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async (key: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quantum-california/admin/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, adminEmail: email, action: "list" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load RSVPs");
        setAuthed(false);
        sessionStorage.removeItem("admin_api_key");
        sessionStorage.removeItem("admin_email");
        return;
      }
      setRsvps(data.rsvps || []);
      setAuthed(true);
      sessionStorage.setItem("admin_api_key", key);
      sessionStorage.setItem("admin_email", email);
    } catch {
      setError("Failed to load RSVPs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const key = sessionStorage.getItem("admin_api_key");
    const email = sessionStorage.getItem("admin_email");
    if (key && email) {
      setApiKey(key);
      setAdminEmail(email);
      load(key, email);
    }
  }, [load]);

  const download = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quantum-california-rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = rsvps.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (dayFilter !== "all" && r.attendance !== dayFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${r.full_name} ${r.email} ${r.organization || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const confirmed = rsvps.filter((r) => r.status === "confirmed").length;
  const waitlisted = rsvps.filter((r) => r.status === "waitlisted").length;

  if (!authed) {
    return (
      <main className="min-h-screen bg-white px-4 pt-32">
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-bold text-[#002F7B]">Quantum California RSVPs</h1>
          <input
            type="email"
            placeholder="Admin email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-3"
          />
          <input
            type="password"
            placeholder="Admin API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3"
          />
          {error && <p className="mt-3 text-red-600">{error}</p>}
          <button
            onClick={() => load(apiKey, adminEmail)}
            disabled={loading}
            className="mt-4 w-full rounded-full bg-[#002F7B] py-3 font-bold text-white disabled:opacity-60"
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[#002F7B]">Quantum California RSVPs</h1>
          <button onClick={download} className="rounded-full bg-[#002F7B] px-6 py-3 font-bold text-white">
            Download CSV
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-lg">
          <span className="font-semibold text-green-700">Confirmed: {confirmed} / 300</span>
          <span className="font-semibold text-amber-700">Waitlisted: {waitlisted}</span>
          <span className="text-gray-600">Total: {rsvps.length}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 px-4 py-2">
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlisted">Waitlisted</option>
          </select>
          <select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="rounded-lg border border-gray-300 px-4 py-2">
            <option value="all">All days</option>
            <option value="day1">Day 1 (Oct 22)</option>
            <option value="day2">Day 2 (Oct 23)</option>
            <option value="both">Both days</option>
            <option value="other">Other</option>
          </select>
          <input
            placeholder="Search name, email, org"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Organization</th>
                <th className="py-3 pr-4">Attending</th>
                <th className="py-3 pr-4">Dietary</th>
                <th className="py-3 pr-4">Accessibility</th>
                <th className="py-3 pr-4">Media</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">{r.full_name}</td>
                  <td className="py-3 pr-4 text-gray-700">{r.email}</td>
                  <td className="py-3 pr-4 text-gray-700">{r.organization || "—"}</td>
                  <td className="py-3 pr-4 text-gray-700">
                    {ATTENDANCE_LABELS[r.attendance] || r.attendance}
                    {r.attendance_other ? ` — ${r.attendance_other}` : ""}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{r.dietary_restrictions || "—"}</td>
                  <td className="py-3 pr-4 text-gray-700">{r.accessibility_needs || "—"}</td>
                  <td className="py-3 pr-4 text-gray-700">{r.media_consent ? "Yes" : "No"}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        r.status === "confirmed"
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                          : "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800"
                      }
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-10 text-center text-gray-500">No RSVPs match these filters.</p>}
        </div>
      </div>
    </main>
  );
}
