"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");

  return (
    <main className="min-h-screen bg-white pt-32 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
        <p className="text-gray-600 mt-3">
          Thanks! Your payment went through.
        </p>

        {sessionId && (
          <p className="mt-3 text-xs text-gray-500">
            Stripe session: <code>{sessionId}</code>
          </p>
        )}

        <div className="mt-8 flex gap-3">
          <Link
            href="/qdw/2026/info"
            className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-6 py-3"
          >
            Back to Event Info
          </Link>
          <Link
            href="/qdw/2026/registration"
            className="inline-block border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold rounded-full px-6 py-3"
          >
            Registration Page
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-32 px-4"><div className="max-w-xl mx-auto">Loading...</div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}