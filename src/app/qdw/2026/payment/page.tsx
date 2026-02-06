"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type RegistrationType =
  | "student_in_person"
  | "student_online"
  | "professional_in_person"
  | "professional_online";

export default function QDW2026PaymentPage() {
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registrationType = sp.get("type") as RegistrationType | null;
    const email = sp.get("email") || undefined;
    const registrationId = sp.get("rid") || undefined;

    if (!registrationType) {
      setError("Missing registration type. Please go back and try again.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationType, email, registrationId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Could not start checkout");

        window.location.assign(data.url);
      } catch (e: any) {
        setError(e?.message || "Failed to start payment.");
      }
    })();
  }, [sp]);

  return (
    <main className="min-h-screen bg-white pt-32 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>

        {!error ? (
          <p className="text-gray-600 mt-3">Redirecting you to Stripe…</p>
        ) : (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}