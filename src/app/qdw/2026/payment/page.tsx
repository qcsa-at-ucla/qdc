"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type RegistrationType =
  | "student_in_person"
  | "student_online"
  | "professional_in_person"
  | "professional_online";

function QDW2026PaymentContent() {
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registrationType = sp.get("type") as RegistrationType | null;

    if (!registrationType) {
      setError("Missing registration type. Please go back and try again.");
      return;
    }

    // Read full registration data from sessionStorage
    const stored = sessionStorage.getItem("qdw_registration");
    if (!stored) {
      setError(
        "Registration data not found. Please go back and fill out the form again."
      );
      return;
    }

    let registrationData: Record<string, any>;
    try {
      registrationData = JSON.parse(stored);
    } catch {
      setError("Invalid registration data. Please go back and try again.");
      return;
    }
  }, [sp]);

  const handleHostedCheckout = async () => {
    const registrationType = sp.get("type") as RegistrationType | null;
    const email = sp.get("email") || undefined;
    const stored = sessionStorage.getItem("qdw_registration");
    
    if (!stored || !registrationType) return;

    try {
      const registrationData = JSON.parse(stored);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationType, email, registrationData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start checkout");

      window.location.assign(data.url);
    } catch (e: any) {
      setError(e?.message || "Failed to start payment.");
    }
  };

  return (
    <main className="min-h-screen bg-white pt-32 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-gray-600 mb-8">Click below to proceed to secure checkout.</p>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
            {error}
            <div className="mt-3">
              <Link
                href="/qdw/2026/registration"
                className="text-purple-600 hover:text-purple-700 underline font-medium"
              >
                ← Back to Registration
              </Link>
            </div>
          </div>
        ) : (
          <button
            onClick={handleHostedCheckout}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-4 transition-all duration-200 hover:scale-105"
          >
            Continue to Checkout
          </button>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your registration will only be saved after successful payment.</p>
          <Link
            href="/qdw/2026/registration"
            className="mt-2 inline-block text-purple-600 hover:text-purple-700 underline"
          >
            ← Back to Registration
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function QDW2026PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-32 px-4"><div className="max-w-xl mx-auto">Loading...</div></div>}>
      <QDW2026PaymentContent />
    </Suspense>
  );
}