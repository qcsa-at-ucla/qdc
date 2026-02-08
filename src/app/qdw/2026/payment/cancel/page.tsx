"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-white pt-32 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Payment cancelled</h1>
        <p className="text-gray-600 mt-3">
          No worries — you can try again anytime.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/qdw/2026/registration"
            className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-6 py-3"
          >
            Back to Registration
          </Link>
          <Link
            href="/qdw/2026/info"
            className="inline-block border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold rounded-full px-6 py-3"
          >
            Event Info
          </Link>
        </div>
      </div>
    </main>
  );
}