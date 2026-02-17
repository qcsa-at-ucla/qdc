"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

function PaymentSuccessContent() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const [verificationStatus, setVerificationStatus] = useState<"checking" | "verified" | "error">("checking");

  useEffect(() => {
    // Verify registration was saved (backup in case webhook was delayed)
    if (sessionId) {
      const verifyRegistration = async () => {
        try {
          const res = await fetch("/api/stripe/verify-registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          const data = await res.json();
          
          if (res.ok && (data.status === "exists" || data.status === "saved")) {
            setVerificationStatus("verified");
          } else {
            console.error("Registration verification failed:", data);
            setVerificationStatus("error");
          }
        } catch (error) {
          console.error("Error verifying registration:", error);
          setVerificationStatus("error");
        }
      };

      // Wait 2 seconds to give webhook time to process, then verify
      const timer = setTimeout(verifyRegistration, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-white pt-32 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
        <p className="text-gray-600 mt-3">
          Thanks! Your payment went through.
        </p>

        {verificationStatus === "checking" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              ⏳ Verifying your registration...
            </p>
          </div>
        )}

        {verificationStatus === "verified" && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Registration confirmed and saved successfully!
            </p>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠ Payment succeeded but registration verification pending. 
              If you don't receive confirmation within 5 minutes, please contact support.
            </p>
          </div>
        )}

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