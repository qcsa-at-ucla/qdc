"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { QC_EVENT } from "../../event";

function SuccessContent() {
  const status = useSearchParams().get("status");
  const waitlisted = status === "waitlisted";

  return (
    <main className="min-h-screen bg-white px-4 pt-32 pb-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#002F7B]">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 text-4xl font-bold text-[#002F7B]">
          {waitlisted ? "You're on the waitlist" : "You're registered!"}
        </h1>

        <p className="mt-4 text-lg text-gray-700">
          {waitlisted
            ? "We've reached venue capacity, so we've added you to the waitlist. We'll email you right away if a spot opens up."
            : `Thanks for your RSVP. We've sent a confirmation email with your details.`}
        </p>

        <p className="mt-6 text-gray-600">
          {QC_EVENT.name} · {QC_EVENT.dates}
        </p>

        <p className="mt-8 text-gray-600">
          Questions?{" "}
          <a href={`mailto:${QC_EVENT.contactEmail}`} className="font-semibold text-[#002F7B] underline">
            {QC_EVENT.contactEmail}
          </a>
        </p>

        <Link
          href="/quantum-california"
          className="mt-10 inline-block rounded-full bg-[#002F7B] px-8 py-3 font-bold text-white transition hover:bg-[#001F55]"
        >
          Back to event
        </Link>
      </div>
    </main>
  );
}

export default function QuantumCaliforniaSuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white pt-32 text-center">Loading…</main>}>
      <SuccessContent />
    </Suspense>
  );
}
