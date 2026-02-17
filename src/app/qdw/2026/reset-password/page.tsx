"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/qdw/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/qdw/2026/member-only");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4 pt-24">
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/10">
        {!success ? (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4"></div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-300">
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!token ? (
              <div className="text-center">
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                  Invalid or missing reset token
                </div>
                <Link
                  href="/qdw/2026/member-only"
                  className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all hover:scale-[1.02]"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-white mb-2 font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-white mb-2 font-medium">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Re-enter your password"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/qdw/2026/member-only"
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-gray-300 mb-6">
              Your password has been reset successfully.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Redirecting you to login...
            </p>
            <Link
              href="/qdw/2026/member-only"
              className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all hover:scale-[1.02]"
            >
              Go to Login Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4 pt-24">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
