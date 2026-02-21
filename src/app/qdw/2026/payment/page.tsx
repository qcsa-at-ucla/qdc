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
  const [isApprovedStudent, setIsApprovedStudent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      const approved = sp.get("approved") === "true";
      const email = sp.get("email");
      const token = sp.get("token");

      if (approved && email && token) {
        // APPROVED STUDENT FLOW: Verify token and load data from database
        try {
          const response = await fetch("/api/qdw/verify-approval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token }),
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data.error || "Invalid or expired approval link. Please contact support.");
            setLoading(false);
            return;
          }

          // Store registration data in state
          setRegistrationData(data.registration);
          setIsApprovedStudent(true);
          setLoading(false);
        } catch (err) {
          console.error("Error verifying approval:", err);
          setError("Failed to verify approval. Please try again or contact support.");
          setLoading(false);
        }
      } else {
        // REGULAR FLOW: Check for sessionStorage data
        const registrationType = sp.get("type") as RegistrationType | null;

        if (!registrationType) {
          setError("Missing registration type. Please go back and try again.");
          setLoading(false);
          return;
        }

        // Read full registration data from sessionStorage
        const stored = sessionStorage.getItem("qdw_registration");
        if (!stored) {
          setError(
            "Registration data not found. Please go back and fill out the form again."
          );
          setLoading(false);
          return;
        }

        let regData: Record<string, any>;
        try {
          regData = JSON.parse(stored);
          setRegistrationData(regData);
          setIsApprovedStudent(false);
          setLoading(false);
        } catch {
          setError("Invalid registration data. Please go back and try again.");
          setLoading(false);
          return;
        }
      }
    };

    checkApprovalStatus();
  }, [sp]);

  const handleHostedCheckout = async () => {
    if (!registrationData) {
      setError("Registration data not found.");
      return;
    }

    try {
      const email = registrationData.email;
      const registrationType = registrationData.registrationType;

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          registrationType, 
          email, 
          registrationData,
          isApproved: isApprovedStudent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start checkout");

      window.location.assign(data.url);
    } catch (e: any) {
      setError(e?.message || "Failed to start payment.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white pt-32 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-32 px-4">
      <div className="max-w-xl mx-auto">
        {isApprovedStudent && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-green-700">
                Your student registration has been approved!
              </span>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-gray-600 mb-8">
          {isApprovedStudent 
            ? "Your student status has been verified. Click below to complete your registration payment."
            : "Click below to proceed to secure checkout."}
        </p>

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
          <>
            {registrationData && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
                <p className="font-semibold text-gray-900 mb-2">Registration Summary:</p>
                <p className="text-gray-900"><strong>Name:</strong> {registrationData.firstName} {registrationData.lastName}</p>
                <p className="text-gray-900"><strong>Email:</strong> {registrationData.email}</p>
                <p className="text-gray-900"><strong>Type:</strong> {registrationData.registrationType?.replace(/_/g, ' ')}</p>
              </div>
            )}
            <button
              onClick={handleHostedCheckout}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full px-8 py-4 transition-all duration-200 hover:scale-105"
            >
              Continue to Checkout
            </button>
          </>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            {isApprovedStudent 
              ? "After payment, you'll be able to upload your files and access the member portal."
              : "Your registration will only be saved after successful payment."}
          </p>
          {!isApprovedStudent && (
            <Link
              href="/qdw/2026/registration"
              className="mt-2 inline-block text-purple-600 hover:text-purple-700 underline"
            >
              ← Back to Registration
            </Link>
          )}
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