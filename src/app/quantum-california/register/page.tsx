"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QC_EVENT } from "../event";

const ATTENDANCE_OPTIONS = [
  { value: "day1", label: "Day 1 only (Oct 22)" },
  { value: "day2", label: "Day 2 only (Oct 23)" },
  { value: "both", label: "Both days (Oct 22–23)" },
  { value: "other", label: "Other" },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#002F7B] focus:outline-none focus:ring-1 focus:ring-[#002F7B]";

export default function QuantumCaliforniaRegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    organization: "",
    jobTitle: "",
    attendance: "",
    attendanceOther: "",
    dietaryRestrictions: "",
    accessibilityNeeds: "",
    mediaConsent: false,
  });

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/quantum-california/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/quantum-california/register/success?status=${data.status}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 pt-32 pb-20">
      <div className="mx-auto max-w-2xl">
        <Link href="/quantum-california" className="text-sm font-semibold text-[#002F7B]">
          ← Back to event
        </Link>
        <h1 className="mt-4 text-4xl font-bold text-[#002F7B]">RSVP</h1>
        <p className="mt-2 text-lg text-gray-600">
          {QC_EVENT.name} · {QC_EVENT.dates}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="fullName" className="block font-semibold text-gray-900">
              Full name <span className="text-red-600">*</span>
            </label>
            <input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-semibold text-gray-900">
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="organization" className="block font-semibold text-gray-900">
              Organization / affiliation
            </label>
            <input
              id="organization"
              value={form.organization}
              onChange={(e) => set("organization", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="jobTitle" className="block font-semibold text-gray-900">
              Job title
            </label>
            <input
              id="jobTitle"
              value={form.jobTitle}
              onChange={(e) => set("jobTitle", e.target.value)}
              className={inputClass}
            />
          </div>

          <fieldset>
            <legend className="font-semibold text-gray-900">
              Which day(s) will you attend? <span className="text-red-600">*</span>
            </legend>
            <div className="mt-2 space-y-2">
              {ATTENDANCE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 text-gray-800">
                  <input
                    type="radio"
                    name="attendance"
                    value={opt.value}
                    required
                    checked={form.attendance === opt.value}
                    onChange={(e) => set("attendance", e.target.value)}
                    className="h-4 w-4 accent-[#002F7B]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {form.attendance === "other" && (
              <input
                aria-label="Please describe your attendance plans"
                placeholder="Please describe"
                required
                value={form.attendanceOther}
                onChange={(e) => set("attendanceOther", e.target.value)}
                className={inputClass}
              />
            )}
          </fieldset>

          <div>
            <label htmlFor="dietaryRestrictions" className="block font-semibold text-gray-900">
              Dietary restrictions or allergies
            </label>
            <textarea
              id="dietaryRestrictions"
              rows={2}
              value={form.dietaryRestrictions}
              onChange={(e) => set("dietaryRestrictions", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="accessibilityNeeds" className="block font-semibold text-gray-900">
              Accessibility accommodations needed
            </label>
            <textarea
              id="accessibilityNeeds"
              rows={2}
              value={form.accessibilityNeeds}
              onChange={(e) => set("accessibilityNeeds", e.target.value)}
              className={inputClass}
            />
          </div>

          <label className="flex items-start gap-3 text-gray-800">
            <input
              type="checkbox"
              checked={form.mediaConsent}
              onChange={(e) => set("mediaConsent", e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#002F7B]"
            />
            <span>
              I consent to being photographed or recorded at this event, and to the use of that
              media for event and program communications.
            </span>
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#002F7B] px-8 py-4 text-lg font-bold text-white transition hover:bg-[#001F55] disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit RSVP"}
          </button>
        </form>
      </div>
    </main>
  );
}
