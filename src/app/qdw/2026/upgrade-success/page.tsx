"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function UpgradeSuccessContent() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [newType, setNewType] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage("No session ID found.");
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/stripe/verify-upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");
        setNewType(data.newRegistrationType || "in-person");
        setStatus("success");
      } catch (err: any) {
        setErrorMessage(err.message || "Something went wrong.");
        setStatus("error");
      }
    };

    verify();
  }, [sessionId]);

  const typeLabel =
    newType === "student_in_person"
      ? "Student In-Person"
      : newType === "professional_in_person"
      ? "Professional In-Person"
      : "In-Person";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center shadow-xl">
        {status === "checking" && (
          <>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-white">Confirming your upgrade…</h1>
            <p className="text-gray-400 mt-2 text-sm">Please wait while we update your registration.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Upgrade Successful!</h1>
            <p className="text-gray-300 mb-1">
              Your registration has been upgraded to{" "}
              <span className="text-blue-400 font-semibold">{typeLabel}</span>.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              You can view your updated registration details in your member portal.
            </p>
            <Link
              href="/qdw/2026/member-only"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Go to Member Portal
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-300 mb-8 text-sm">{errorMessage}</p>
            <Link
              href="/qdw/2026/member-only"
              className="inline-block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Return to Member Portal
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UpgradeSuccessContent />
    </Suspense>
  );
}
