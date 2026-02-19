"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

// Convert base64 back to File object
function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function PaymentSuccessContent() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const [verificationStatus, setVerificationStatus] = useState<"checking" | "uploading" | "verified" | "error">("checking");
  const [uploadMessage, setUploadMessage] = useState("");

  // Determine if we're in a critical state where leaving would lose data
  const isProcessing = verificationStatus === "checking" || verificationStatus === "uploading";

  // Warn user before leaving if uploads are in progress
  useEffect(() => {
    if (!isProcessing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers require returnValue to be set
      e.returnValue = "Your registration is still being processed. If you leave now, your uploaded files may not be saved.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing]);

  useEffect(() => {
    if (!sessionId) return;

    const processPaymentSuccess = async () => {
      try {
        // Get registration data from sessionStorage
        const stored = sessionStorage.getItem("qdw_registration");
        if (!stored) {
          console.error("No registration data found in sessionStorage");
          setVerificationStatus("error");
          return;
        }

        const registrationData = JSON.parse(stored);
        
        // Upload files NOW (after successful payment)
        setVerificationStatus("uploading");
        let posterUrl = "";
        let studentIdPhotoUrl = "";

        // Upload poster PDF if exists
        if (registrationData.posterBase64 && registrationData.posterFileName) {
          setUploadMessage("Uploading CV/Poster...");
          const posterFile = base64ToFile(registrationData.posterBase64, registrationData.posterFileName);
          const posterFormData = new FormData();
          posterFormData.append("file", posterFile);
          posterFormData.append("email", registrationData.email);
          posterFormData.append("firstName", registrationData.firstName);
          posterFormData.append("lastName", registrationData.lastName);

          const posterRes = await fetch("/api/upload-poster", {
            method: "POST",
            body: posterFormData,
          });

          if (posterRes.ok) {
            const posterData = await posterRes.json();
            posterUrl = posterData.url || "";
          } else {
            console.error("Poster upload failed");
          }
        }

        // Upload student ID photo if exists
        if (registrationData.studentIdBase64 && registrationData.studentIdFileName) {
          setUploadMessage("Uploading Student ID...");
          const studentIdFile = base64ToFile(registrationData.studentIdBase64, registrationData.studentIdFileName);
          const studentIdFormData = new FormData();
          studentIdFormData.append("file", studentIdFile);
          studentIdFormData.append("firstName", registrationData.firstName);
          studentIdFormData.append("lastName", registrationData.lastName);

          const studentIdRes = await fetch("/api/upload-student-id", {
            method: "POST",
            body: studentIdFormData,
          });

          if (studentIdRes.ok) {
            const studentIdData = await studentIdRes.json();
            studentIdPhotoUrl = studentIdData.url || "";
          } else {
            console.error("Student ID upload failed");
          }
        }

        // Verify registration and update with file URLs
        setUploadMessage("Finalizing registration...");
        const res = await fetch("/api/stripe/verify-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            sessionId,
            posterUrl,
            studentIdPhotoUrl,
          }),
        });

        const data = await res.json();
        
        if (res.ok && (data.status === "exists" || data.status === "saved" || data.status === "updated")) {
          // Clear sessionStorage after successful registration
          sessionStorage.removeItem("qdw_registration");
          setVerificationStatus("verified");
        } else {
          console.error("Registration verification failed:", data);
          setVerificationStatus("error");
        }
      } catch (error) {
        console.error("Error processing payment success:", error);
        setVerificationStatus("error");
      }
    };

    // Wait 2 seconds to give webhook time to process, then upload files and verify
    const timer = setTimeout(processPaymentSuccess, 2000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-white pt-32 px-4">
      {/* Blocking overlay modal during processing */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-xl">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {verificationStatus === "checking" ? "Verifying Payment..." : "Uploading Your Files..."}
            </h2>
            <p className="text-gray-600 mb-4">
              {uploadMessage || "Please wait while we process your registration."}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                ⚠️ Please do not close or navigate away from this page until the process is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
        <p className="text-gray-600 mt-3">
          Thanks! Your payment went through.
        </p>

        {verificationStatus === "checking" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              ⏳ Verifying your payment...
            </p>
          </div>
        )}

        {verificationStatus === "uploading" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              ⏳ {uploadMessage || "Processing your registration..."}
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

        {/* Only show navigation links when not processing */}
        {!isProcessing && (
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
        )}
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